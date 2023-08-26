#pragma once
#define ARDUINO 101
#include "SensorInterface.h"
//
// class for PIR motion sensor
//
class MotionSensor: public ISensor {
public:
	MotionSensor(int pin, int ledPin);
  
  void Begin() override;
  bool ReadPIR(bool print = false) override;
  float *Read(bool print = false) override{ float* f= nullptr; return f;};

private:
	// PIRCalibration
	void				PIRCalibration(bool print);

	int CALIBARAION_SAMPLE_TIMES = 30; //the time we give the sensor to calibrate (10-60 secs according to the datasheet)

	//the time when the sensor outputs a low impulse
	long unsigned int lowIn;

	//the amount of milliseconds the sensor has to be low 
	//before we assume all motion has stopped
	long unsigned int pause = 5000;

	bool lockLow = true;
	bool takeLowTime = false;

	int _ledPin;
	int _pirPin;

	int lastReadTime = 0;
};
