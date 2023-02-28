import serial
from serial import SerialException
import json
import os
import sys
import paho.mqtt.client as mqttClient

class SerialToMqtt:

    def __init__(self, param):
        self.parameters = param
        self.loadParameters()

    def loadParameters(self):
        with open(self.parameters)as f:
            self.param = json.load(f)

    def run(self):
        print("Opening port and starting to send data to mttq broker")
        print("Press Ctrl+C to stop")
        try:
            ser = serial.Serial(
                self.param["port"], self.param["baudrate"], timeout=1)
            ser.readline()  # Line with no data
            while(True):
                line = str(ser.readline()).replace("\\r\\n", "")[2:-1]
                if(len(line) > 0):
                    print(line)
                    try:
                        self.sensors = json.loads(line)
                    except Exception as e:
                        print("Error parse json")
                        print(e)
        except SerialException as se:
            print("Error when tried to open the port")
            print(se)

        except Exception as e:
            print("Error when tried to open the port")
            print(e)


def doc():
    print("Use SerialToMttq.py to send data to mttq server.")
    print("Please configure the config.json file with the proper data.")
    print("Use -c parameter to get custom config.json location")


if __name__ == "__main__":

    if (not os.path.exists("config.json")):
        print("config.json not found.")
        doc()
        exit()
    else:
        if(len(sys.argv[1:]) == 0):
            s = SerialToMqtt("config.json")
        elif(sys.argv[1] == '-o'):
            if(len(sys.argv[1:]) >= 2):
                s = SerialToMqtt("config.json")
            else:
                print("Missing output file")
                doc()
                exit()
        s.run()
        