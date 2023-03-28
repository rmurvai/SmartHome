#pragma once

#define ARDUINO 101

#include <MQ2.h>
#include "SensorInterface.h"

//
// class for MQ2 gas sensor
//
class GasSensor : public ISensor
{
public:
    GasSensor(int pin);

    void Begin() override;
    float *Read(bool print = false) override;

private:
    MQ2 *_mq2;
    static float _lpg;
    static float _co;
    static float _smoke;
    static unsigned long _lastReadTime;
    float values[3];
};
