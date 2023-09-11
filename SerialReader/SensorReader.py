import json
import logging.config
from serial import Serial

class SensorReader:
    def __init__(self, port, baudrate, timeout):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial = None

    async def __aenter__(self):
        logging.info("Start initializing serial")
        self.serial = Serial(
            port=self.port, baudrate=self.baudrate, timeout=self.timeout)
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
            logging.info("%s", line)
            return None

        return data
