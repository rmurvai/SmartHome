# SmartHome
Application to read some data from sensors 

## What you will need
* Arduino Uno
* DHT22 temperature/humidity sensor
* Pir sensor for motion detection
* MQ-2 sensor for LPG, CO and smoke detection
* one led
* breadboard 
* wires

## The circuit
![conexiuniv3](https://user-images.githubusercontent.com/7062074/225157704-22415c2b-6299-43dd-a065-b5552f2fbc1b.JPG)

## Project Arduino sensors
In this project is the code that read all the data from the dht22, mq-2 and pir movement sensor and send the data packed as json to serial.

Json example:
```json
{
  "dht22": {
    "temperature": 22,
    "humidity": 50
  },
  "mq2": {
    "lpg": 0.2,
    "co": 0,
    "smoke": 0.66
  },
  "pir":{
    "movement": true
  }
}
```

## Project SerialReader
In this folder is the python script that read from the serial the data sent by the Arduino board and after unpack the json send it to MQTT broker server

The pyhon script need to use an configuration file config.ini as the below example:
```ini
[serial]
port = COM3
baudrate = 9600
timeout = 1

[mqtt]
host = localhost
port = 1883
username = user
password = test
topic = sensors

[logging]
level = INFO
```

## MQTT server
For runing this project you need to setup the mqtt broker server.
In this project is used  [Mosquitto](https://mosquitto.org/download/)
1. Download the [Mosquitto](https://mosquitto.org/download/) application
2. Install the application
3. Go to the installation folder, open an elevated power shell and run `./mosquitto install` to install as a service
4. Start the service with the prompt `sc start mosquitto`
5. Edit the configuration file (`mosquitto.conf`) to add:
 - `allow_anonymous false` in order to use user/password
 - `listener 9001`
 - `procotol websockets` for the web application
 - `listenet 1883`
 - `protocol mqtt` for python application 
 - `socket_domain ipv4`
 - `password_file C:\Program Files\mosquitto\smarthome.txt` where password is store encrypted and generated as below
6. Create an user with the following command `mosquitto_passwd -c smarthome.txt user` and when you are prompted to enter a password for the user enter the `test` as passwod(this is curently used in the config.ini file for the python)

## Web Application
For running the web application you just need to open the SensorData.html in a browser
If you don't have data from sensors you should get the following page
<p align="center">
  <img src="https://user-images.githubusercontent.com/7062074/231910533-d1632c87-88c3-4ba0-b5b5-77717f00ceda.png">
</p>
The page for the running sensors is:
<p align="center">
  <img src="https://user-images.githubusercontent.com/7062074/231912101-0fa570ad-9e2c-4bd6-ab79-81b58a4f26b9.png">
</p>
and at the risk:
<p align="center">
  <img src="https://user-images.githubusercontent.com/7062074/231912153-fa266391-17f6-4abb-836d-cea5157ba6b3.png">
</p>


