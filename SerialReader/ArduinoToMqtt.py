import json
import logging.config
import time
import configparser
import asyncio
import paho.mqtt.client as mqtt
from serial import Serial
import requests
import smtplib
import ssl
from email.message import EmailMessage
import datetime

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
    def __init__(self, host, port, username, password, mail_key, mail_from, mail_to, notificationTime):
        self.client = mqtt.Client()
        self.client.username_pw_set(username, password)
        self.client.connect(host, port)
        self.mail_key = mail_key 
        self.mail_from = mail_from
        self.mail_to = mail_to
        self.tempLastSend = -1
        self.humidityLastSend = -1
        self.pirLastSend = -1
        self.lpgLastSend = -1
        self.smokeLastSend = -1
        self.coLastSend = -1
        self.notificationTime = notificationTime

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
        self.notificationLogic(processed_json)

        # logic to send data to mqtt
        for i in range(max_retries):
            result, _ = self.client.publish(topic, processed_json)
            if result == mqtt.MQTT_ERR_SUCCESS:
                return True
            logging.warning("Publishing failed with error code %d, retrying in %d seconds...", result, retry_interval)
            await asyncio.sleep(retry_interval)
        logging.error("Max retries (%d) exceeded, giving up on publishing to %s", max_retries, topic)
        return False
    
    
    def sendMail(self, subject, message):
        port = 465  # For SSL
        smtp_server = "smtp.gmail.com"
        #password = input("Type your password and press enter: ")

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = self.mail_from
        msg['To'] = self.mail_to

        # Set the content of the email message
        msg.set_content(message)

        context = ssl.create_default_context()
        try:
            with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
                server.login(self.mail_from, self.mail_key)
                server.send_message(msg)
        except smtplib.SMTPException:
            print("Error: unable to send email")
    
    def notificationLogic(self, data):
        data = json.loads(data)
        if data["dht22"]["temperature"]["risk"] and (self.tempLastSend == -1 or time.time() - self.tempLastSend > self.notificationTime):
            self.tempLastSend = time.time()
            message = f'S-a declansat alerta pentru temperatura la data de {datetime.datetime.now()}. Valoarea temperaturi este {data["dht22"]["temperature"]["value"]}'
            self.sendMail("Alerta temperatura!", message)
        
        if data["dht22"]["humidity"]["risk"] and (self.humidityLastSend == -1 or time.time() - self.humidityLastSend > self.notificationTime):
            self.humidityLastSend = time.time()
            message = f'S-a declansat alerta pentru umiditate la data de {datetime.datetime.now()}. Valoarea umiditatii este {data["dht22"]["humidity"]["value"]}%'
            self.sendMail("Alerta umiditate!", message)

        if data["mq2"]["lpg"]["risk"] and (self.lpgLastSend == -1 or time.time() - self.lpgLastSend > self.notificationTime):
            self.lpgLastSend = time.time()
            message = f'S-a declansat alerta pentru nivel crescut de particule de gaz petrolier lichefiat la data de {datetime.datetime.now()}. Valoarea lpg este {data["mq2"]["lpg"]["value"]} ppm'
            self.sendMail("Alerta depasire nivel particule de gaz petrolier lichefiat!", message)

        if data["mq2"]["co"]["risk"] and (self.coLastSend == -1 or time.time() - self.coLastSend > self.notificationTime):
            self.coLastSend = time.time()
            message = f'S-a declansat alerta pentru nivel crescut de particule de monoxid de carbon la data de {datetime.datetime.now()}. Valoarea lpg este {data["mq2"]["co"]["value"]} ppm'
            self.sendMail("Alerta depasire nivel particule de monoxid de carbon!", message)

        if data["mq2"]["smoke"]["risk"] and (self.smokeLastSend == -1 or time.time() - self.smokeLastSend > self.notificationTime):
            self.smokeLastSend = time.time()
            message = f'S-a declansat alerta pentru nivel crescut de particule de fum la data de {datetime.datetime.now()}. Valoarea lpg este {data["mq2"]["smoke"]["value"]} ppm'
            self.sendMail("Alerta depasire nivel particule de fum!", message)

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
                                    config["mail"]["key"],
                                    config["mail"]["from"],
                                    config["mail"]["to"],
                                    int(config["mail"]["notificationTime"]))

        # Start read and publish tasks
        topic = config["mqtt"]["topic"]
        tasks = [read_and_publish(sensor_reader, mqtt_publisher, topic)]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
