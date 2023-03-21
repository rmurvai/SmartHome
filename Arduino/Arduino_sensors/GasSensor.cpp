#include "GasSensor.h"

static const unsigned long READ_INTERVAL = 10000UL; // read every 10 seconds

float GasSensor::_lpg = 0;
float GasSensor::_co = 0;
float GasSensor::_smoke = 0;
unsigned long GasSensor::_lastReadTime = 0;

// Constructor
GasSensor::GasSensor(int pin) : _mq2(new MQ2(pin))
{
}

//
// Begin
//
void GasSensor::Begin()
{
    _mq2->begin();
}

//
//
//
float *GasSensor::Read(bool print)
{
    unsigned long now = millis();
    if (now < _lastReadTime + READ_INTERVAL)
    {
        static float values[3] = {_lpg, _co, _smoke};
        return values;
    }

    _lpg = _mq2->readLPG();
    _co = _mq2->readCO();
    _smoke = _mq2->readSmoke();

    if (print)
    {
        Serial.print("LPG:");
        Serial.print(_lpg);
        Serial.print(" ");
        Serial.print("CO:");
        Serial.print(_co);
        Serial.print("SMOKE:");
        Serial.print(_smoke);
        Serial.print("\n");
    }

    // save the last time read
    _lastReadTime = now;

    static float values[3] = {_lpg, _co, _smoke};
    return values;
}