#include "MotionSensor.h"
#include "Arduino.h" 

MotionSensor::MotionSensor(int pirPin, int ledPin)
{
	_pirPin = pirPin;
	_ledPin = ledPin;
}

void MotionSensor::Begin(bool print)
{
	// PIR movement sensor setup
	pinMode(_pirPin, INPUT);
	pinMode(_ledPin, OUTPUT);
	digitalWrite(_pirPin, LOW);

	PIRCalibration(print);
}

void MotionSensor::PIRCalibration(bool print)
{
	//give the sensor some time to calibrate
	if(print)
		Serial.print("calibrating sensor ");
	for (int i = 0; i < CALIBARAION_SAMPLE_TIMES; i++)
	{
		if (print)
			Serial.print(".");
		delay(1000);
	}
	if (print)
		Serial.println("[DONE] SENSOR ACTIVE");
	
}

bool MotionSensor::MotionDetected(bool print)
{
	if (digitalRead(_pirPin) == HIGH)
	{
		digitalWrite(_ledPin, HIGH);   //the led visualizes the sensors output pin state
		if (lockLow)
		{
			//makes sure we wait for a transition to LOW before any further output is made:
			lockLow = false;
			if (print)
			{
				Serial.println("---");
				Serial.print("motion detected at ");
				Serial.print(millis() / 1000);
				Serial.println(" sec");
			}
			delay(50);
		}
		takeLowTime = true;

		return true;
	}

	return false;
}

bool MotionSensor::MotionEnded(bool print)
{
	if (digitalRead(_pirPin) == LOW)
	{
		digitalWrite(_ledPin, LOW);  //the led visualizes the sensors output pin state

		if (takeLowTime)
		{
			lowIn = millis();          //save the time of the transition from high to LOW
			takeLowTime = false;       //make sure this is only done at the start of a LOW phase
		}
		//if the sensor is low for more than the given pause, 
		//we assume that no more motion is going to happen
		if (!lockLow && millis() - lowIn > pause)
		{
			//makes sure this block of code is only executed again after 
			//a new motion sequence has been detected
			lockLow = true;
			if (print)
			{
				Serial.print("motion ended at ");      //output
				Serial.print((millis() - pause) / 1000);
				Serial.println(" sec");
			}
			delay(50);
		}

		return true;
	}

	return false;
}
