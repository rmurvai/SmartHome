#include <ArduinoJson.h>
#include "TemperatureAndHumidity.h"
#include "MotionSensor.h"
#include "GasSensor.h"

#define MQ2pin 0    // the digital pin connected to MQ2 sensor's output
#define DHT22pin 7  // the digital pin connected to DHT22 sensor's output   
#define PIRpin 3    // the digital pin connected to the PIR sensor's output
#define LEDpin 13   // the digital pin connected to the led for semnalise the movement

GasSensor gasSensor(MQ2pin);
DHT22Sensor tempAndHumiditySensor(DHT22pin);
MotionSensor motionSensor(PIRpin,LEDpin);

void setup() {
  // put your setup code here, to run once:
    Serial.begin( 9600 );
    tempAndHumiditySensor.Begin();
    gasSensor.Begin(false);
    motionSensor.Begin(false);
}

void loop() {
  // put your main code here, to run repeatedly:
  float* gas = gasSensor.Read(false);
  float* temp = tempAndHumiditySensor.Read(false);
  motionSensor.MotionDetected(false);
  motionSensor.MotionEnded(false);
  
  //construct json
  StaticJsonDocument<200> doc;
  doc["sensor"] = "dht22";
  doc["temperature"] = temp[0];
  doc["humidity"] = temp[1];
  doc["sensor"] = "mq2";
  doc["lpg"] = gas[0];
  doc["co"] = gas[1];
  doc["smoke"] = gas[2];

  serializeJson(doc, Serial);
  
  delay(1000);
}
