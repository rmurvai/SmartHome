#pragma once
#include <DHT.h>

//
// class for PIR motion sensor
//
class MotionSensor {
public:
	//
	// Constructor
	//
	MotionSensor(int pin, int ledPin);

	//
	// MotionDetected function
	//
	bool MotionDetected(bool print);

	//
	// MotionEnded function
	//
	bool MotionEnded(bool print);

	//
	// Begin |start calibration|
	//
	void                Begin(bool print);

private:

	//
	// PIRCalibration
	//
	void				PIRCalibration(bool print);

	int CALIBARAION_SAMPLE_TIMES = 30; //the time we give the sensor to calibrate (10-60 secs according to the datasheet)

	//the time when the sensor outputs a low impulse
	long unsigned int lowIn;

	//the amount of milliseconds the sensor has to be low 
	//before we assume all motion has stopped
	long unsigned int pause = 5000;

	boolean lockLow = true;
	boolean takeLowTime = false;

	int _ledPin;
	int _pirPin;

	int lastReadTime = 0;
};
