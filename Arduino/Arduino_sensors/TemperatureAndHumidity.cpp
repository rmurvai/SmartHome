#include "TemperatureAndHumidity.h"


static const int DHTTYPE = DHT22;					// DHT 22  (AM2302)
static const unsigned long READ_INTERVAL = 1000UL; // read every 1 seconds

float DHT22Sensor::_humidity = 0;
float DHT22Sensor::_temperature = 0;
unsigned long DHT22Sensor::_lastReadTime = 0;

// Constructor
DHT22Sensor::DHT22Sensor(int pin) : _dht(new DHT(pin, DHTTYPE))
{
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
	unsigned long now = millis();
	if (now < _lastReadTime + READ_INTERVAL)
	{
		return values;
	}

	_humidity = _dht->readHumidity();
	_temperature = _dht->readTemperature();

	if (print)
	{
		Serial.print("Temperature:");
		Serial.print(_temperature);
    Serial.print(" ");
		Serial.print("Humidity");
		Serial.print(_humidity);
		Serial.print("\n");
	}

	// save the last time read
	_lastReadTime = now;

	values[0] = _temperature;
  values[1] =  _humidity;
	return values;
}