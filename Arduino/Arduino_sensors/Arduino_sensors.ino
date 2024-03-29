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

    Serial.print("Start Initializing temperature/Humidity sensor");
    Serial.println();
    tempAndHumiditySensor.Begin();
    Serial.print("Initializing succesfull temperature/Humidity sensor");
    Serial.println();
    
    Serial.print("Start Initializing gas sensor");
    Serial.println();
    gasSensor.Begin();
    Serial.print("Initializing succesfull gas sensor");
    Serial.println();
    
    Serial.print("Start Initializing movement sensor");
    Serial.println();
    motionSensor.Begin();
    Serial.print("Initializing succesfull movement sensor");
    Serial.println();
}

void loop() {
  // put your main code here, to run repeatedly:
  float* gas = gasSensor.Read(false);
  float* temp = tempAndHumiditySensor.Read(false);
  bool motionDetected = motionSensor.ReadPIR(false);
  
 //construct json
  StaticJsonDocument<200> doc;
  // Add the "dht22" object
  JsonObject dht22 = doc.createNestedObject("dht22");
  dht22["temperature"] = temp[0];
  dht22["humidity"] = temp[1];
  // Add the "mq2" object
  JsonObject mq2 = doc.createNestedObject("mq2");
  mq2["lpg"] = gas[0];
  mq2["co"] = gas[1];
  mq2["smoke"] = gas[2];
  JsonObject pir = doc.createNestedObject("pir");
  pir["movement"] = motionDetected;

  Serial.println();
  serializeJson(doc, Serial); 
  
  delay(1000);
}
