#pragma once
#include <DHT.h>
#include "SensorInterface.h"

//
// class for DHT22 temperature and humidity sensor
//
class DHT22Sensor: public ISensor {
public:
	DHT22Sensor(int pin);

	void Begin() override;
	float* Read(bool print = false) override;

private:
	DHT* _dht;
	static float _humidity;
	static float _temperature;
	static unsigned long _lastReadTime;
  float values[2];
};
