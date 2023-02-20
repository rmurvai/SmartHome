#include "TemperatureAndHumidity.h"


#define DHTTYPE DHT22   // DHT 22  (AM2302)

//
// Constructor
//
DHT22Sensor::DHT22Sensor(int pin)
{
	_dht = new DHT(pin, DHTTYPE);
}

//
// Begin
//
void DHT22Sensor::Begin()
{
	_dht->begin();
}

//
//
//
float* DHT22Sensor::Read(bool print)
{
	//
	// read data from sensors
	//
	humidity = ReadHumidity();
	temperature = ReadTemperature();
	
	if (print)
	{
		Serial.print("Temperature:");
		Serial.print(temperature);
    Serial.print(" ");
		Serial.print("Humidity");
		Serial.print(humidity);
		Serial.print("\n");
	}

	//
	// save the last time read
	//
	lastReadTime = millis();
	static float values[2] = { temperature,humidity };
	return values;
}

//
// ReadTemperature
//
float DHT22Sensor::ReadTemperature()
{
	//
	// if we want to read before 10 sec difference time we return from cache data
	//
	if (millis() < (lastReadTime + 10000) && temperature != 0)
	{
		return temperature;
	}
	else
	{
		return temperature = _dht->readTemperature();
	}
}

//
// ReadHumidity
//
float DHT22Sensor::ReadHumidity()
{
	//
	// if we want to read before 10 sec difference time we return from cache data
	//
	if (millis() < (lastReadTime + 10000) && humidity != 0)
	{
		return humidity;
	}
	else
	{
		return humidity = _dht->readHumidity();
	}
}
