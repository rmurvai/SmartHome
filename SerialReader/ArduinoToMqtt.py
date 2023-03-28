import json
import logging.config
import time
import configparser
import asyncio
import paho.mqtt.client as mqtt
from serial import Serial

class SensorReader:
    def __init__(self, port, baudrate, timeout):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial = None

    async def __aenter__(self):
        self.serial = Serial(port=self.port, baudrate=self.baudrate, timeout=self.timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.serial is not None:
            self.serial.close()

    async def read_data(self):
        if self.serial is None:
            raise ValueError("Serial connection not established")

        line = self.serial.readline().decode().strip()
        if not line:
            return None
        
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            logging.warning("Failed to parse data from serial port: %s", line)
            return None

        return data

class MqttPublisher:
    def __init__(self, host, port, username, password):
        self.client = mqtt.Client()
        self.client.username_pw_set(username, password)
        self.client.connect(host, port)

    async def publish(self, topic, data, retry_interval=5, max_retries=3):
        payload = json.dumps(data)
        for i in range(max_retries):
            result, _ = self.client.publish(topic, payload)
            if result == mqtt.MQTT_ERR_SUCCESS:
                return True
            logging.warning("Publishing failed with error code %d, retrying in %d seconds...", result, retry_interval)
            await asyncio.sleep(retry_interval)
        logging.error("Max retries (%d) exceeded, giving up on publishing to %s", max_retries, topic)
        return False

async def read_and_publish(sensor_reader, mqtt_publisher, topic):
    while True:
        data = await sensor_reader.read_data()
        if data is not None:
            await mqtt_publisher.publish(topic, data)

async def main():
    config = configparser.ConfigParser()
    try:
        config.read("config.ini")
    except Exception:
        print("error reading config file")
        
    # Configure logging
    logging.basicConfig(
        level=config.get("logging", "level", fallback="INFO"),
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler()],
    )


    # Instantiate SensorReader and MqttPublisher objects
    async with SensorReader(config["serial"]["port"],
                                  int(config["serial"]["baudrate"]),
                            int(config["serial"]["timeout"])) as sensor_reader:
        mqtt_publisher = MqttPublisher(config["mqtt"]["host"],
                                    int(config["mqtt"]["port"]),
                                    config["mqtt"]["username"],
                                    config["mqtt"]["password"])

        # Start read and publish tasks
        topic = config["mqtt"]["topic"]
        tasks = [read_and_publish(sensor_reader, mqtt_publisher, topic)]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
