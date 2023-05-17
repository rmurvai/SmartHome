import json
import logging.config
import time
import configparser
import asyncio
import paho.mqtt.client as mqtt
from serial import Serial
import requests

ifttt_url = "https://maker.ifttt.com/trigger/{}/json/with/key/{}"

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

class WebPublisher:
    def __init__(self, host, port, username, password, key):
        self.client = mqtt.Client()
        self.client.username_pw_set(username, password)
        self.client.connect(host, port)
        self.key = key 

    def processData(self, data):
        dict = {'dht22':
                {'temperature': {'value': data["dht22"]["temperature"], 'risk': True if data["dht22"]["temperature"] < 8 or data["dht22"]["temperature"] > 35 else False},
                 'humidity': {'value': data["dht22"]["humidity"], 'risk': True if data["dht22"]["humidity"] < 40 or data["dht22"]["humidity"] > 60 else False}
                },
                'mq2': {'lpg': {'value': data["mq2"]["lpg"], 'risk': False if data["mq2"]["lpg"] < 100 else True},
                        'co': {'value': data["mq2"]["co"], 'risk': False if data["mq2"]["co"] < 100 else True},
                        'smoke': {'value': data["mq2"]["smoke"], 'risk': False if data["mq2"]["smoke"] < 100 else True}
                        }}

        return json.dumps(dict)
    

    async def publish(self, topic, data, retry_interval=5, max_retries=3):
        payload = json.dumps(data)
        processed_json = self.processData(data)
        # logic to send to ifttt data
        self.logicIfttt(processed_json)

        # logic to send data to mqtt
        for i in range(max_retries):
            result, _ = self.client.publish(topic, processed_json)
            if result == mqtt.MQTT_ERR_SUCCESS:
                return True
            logging.warning("Publishing failed with error code %d, retrying in %d seconds...", result, retry_interval)
            await asyncio.sleep(retry_interval)
        logging.error("Max retries (%d) exceeded, giving up on publishing to %s", max_retries, topic)
        return False
    
    def sendToIfttt(self, event_name, data):
        response = requests.post(ifttt_url.format(event_name, self.key), json=json.loads(data))
        print(response.text)
        return response.ok
    
    def logicIfttt(self, data):
        data = json.loads(data)
        if data["dht22"]["temperature"]["risk"]:
            self.sendToIfttt("temp_alert", json.dumps({'temperature': data["dht22"]["temperature"]["value"]}))
        
        if data["dht22"]["humidity"]["risk"]:
            self.sendToIfttt("humidity_alert", json.dumps({'humidity': data["dht22"]["humidity"]["value"]}))

        if data["mq2"]["lpg"]["risk"]:
            self.sendToIfttt("lpg_alert", json.dumps({'lpg': data["mq2"]["lpg"]["value"]}))

        if data["mq2"]["co"]["risk"]:
            self.sendToIfttt("co_alert", json.dumps({'co': data["mq2"]["co"]["value"]}))

        if data["mq2"]["smoke"]["risk"]:
            self.sendToIfttt("smoke_alert", json.dumps({'smoke': data["mq2"]["smoke"]["value"]}))



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
        mqtt_publisher = WebPublisher(config["mqtt"]["host"],
                                    int(config["mqtt"]["port"]),
                                    config["mqtt"]["username"],
                                    config["mqtt"]["password"],
                                    config["ifttt"]["key"])

        # Start read and publish tasks
        topic = config["mqtt"]["topic"]
        tasks = [read_and_publish(sensor_reader, mqtt_publisher, topic)]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
