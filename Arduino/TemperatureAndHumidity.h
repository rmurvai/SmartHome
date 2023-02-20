#pragma once
#include <DHT.h>

//
// class for DHT22 temperature and humidity sensor
//
class DHT22Sensor {
public:
	//
	// Constructor
	//
	DHT22Sensor(int pin);

	//
	// Read function
	//
	float* Read(bool print);

	//
	// ReadTemperature
	//
	float               ReadTemperature();

	//
	// ReadHumidity
	// 
	float               ReadHumidity();

	//
	// Begin
	//
	void                Begin();

private:
	DHT* _dht;

	float humidity = 0;
	float temperature = 0;

	int lastReadTime = 0;
};
