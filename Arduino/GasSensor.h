#pragma once
#include "Arduino.h"

//
// class for MQ2 gas sensor
//
class GasSensor {
public:
    //
    // Constructor
    //
    GasSensor (int pin);

    //
    // Read function
    //
    float*              Read                        (bool print);

    //
    // readLPG
    //
    float               ReadLPG                     ();

    //
    // readCO
    // 
    float               ReadCO                      ();

    //
    // readSmoke
    //
    float               ReadSmoke                   ();

    //
    // Begin |start calibration|
    //
    void                Begin                       (bool print);

private:

    //
    // MQRead
    //
    float               MQRead                      ();

    //
    // MQGetGasPercentage
    //
    float               MQGetGasPercentage          (float rs_ro_ratio, int gas_id);

    //
    // MQGetPercentage
    //
    int                 MQGetPercentage             (float rs_ro_ratio, float *pcurve);

    //
    // MQCalibration
    //
    float               MQCalibration               ();

    //
    // MQResistanceCalculation
    //
    float               MQResistanceCalculation     (int raw_adc);

    int _pin;
    int RL_VALUE                    = 5;     //define the load resistance on the board, in kilo ohms
    int RO_CLEAN_AIR_FACTOR         = 9.83;
    int CALIBARAION_SAMPLE_TIMES    = 5;
    int CALIBRATION_SAMPLE_INTERVAL = 50;
    int READ_SAMPLE_INTERVAL        = 50;
    int READ_SAMPLE_TIMES           = 5;

    float LPGCurve[3]   = { 2.3,0.21,-0.47 };
    float COCurve[3]    = { 2.3,0.72,-0.34 };
    float SmokeCurve[3] = { 2.3,0.53,-0.44 };
    float Ro            = 10;

    int GAS_LPG   = 0;
    int GAS_CO    = 1;
    int GAS_SMOKE = 2;

    float lpg   = 0;
    float co    = 0;
    float smoke = 0;

    int lastReadTime = 0;
};
