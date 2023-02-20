#include "GasSensor.h"




//
// Constructor
//
GasSensor::GasSensor(int pin) 
{
    _pin = pin;
}

//
// Begin
//
void GasSensor::Begin(bool print) 
{
    //
    // calibrate sensor
    //
    Ro = MQCalibration();

    if (print)
    {
        Serial.print("Ro: ");
        Serial.print(Ro);
        Serial.println(" kohm");
    }
}

//
//
//
float* GasSensor::Read(bool print) 
{
    //
    // read data from sensors
    //
    lpg   = MQGetGasPercentage(MQRead() / Ro, GAS_LPG);
    co    = MQGetGasPercentage(MQRead() / Ro, GAS_CO);
    smoke = MQGetGasPercentage(MQRead() / Ro, GAS_SMOKE);

    if (print) 
    {
        Serial.print("LPG:");
        Serial.print(lpg);
        Serial.print("ppm");
        Serial.print("    ");
        Serial.print("CO:");
        Serial.print(co);
        Serial.print("ppm");
        Serial.print("    ");
        Serial.print("SMOKE:");
        Serial.print(smoke);
        Serial.print("ppm");
        Serial.print("\n");
    }

    //
    // save the last time read
    //
    lastReadTime = millis();
    static float values[3] = { lpg,co,smoke };
    return values;
}

//
// ReadLPG
//
float GasSensor::ReadLPG() 
{
    //
    // if we want to read before 10 sec difference time we return from cache data
    //
    if (millis()<(lastReadTime + 10000) && lpg != 0) 
    {
        return lpg;
    }
    else 
    {
        return lpg = MQGetGasPercentage(MQRead() / Ro, GAS_LPG);
    }
}

//
// ReadCO
//
float GasSensor::ReadCO() 
{
    //
    // if we want to read before 10 sec diference time we return from cache data
    //
    if (millis()<(lastReadTime + 10000) && co != 0) 
    {
        return co;
    }
    else 
    {
        return co = MQGetGasPercentage(MQRead() / Ro, GAS_CO);
    }
}

//
// ReadSmoke
//
float GasSensor::ReadSmoke() 
{
    //
    // if we want to read before 10 sec diference time we return from cache data
    //
    if (millis()<(lastReadTime + 10000) && smoke != 0) 
    {
        return smoke;
    }
    else 
    {
        return smoke = MQGetGasPercentage(MQRead() / Ro, GAS_SMOKE);
    }
}

//
// MQResistanceCalculation
//
float GasSensor::MQResistanceCalculation(int raw_adc) 
{
    return (((float)RL_VALUE*(1023 - raw_adc) / raw_adc));
}

//
// MQCalibration
//
float GasSensor::MQCalibration() 
{
    float val = 0;

    //
    // take multiple samples
    //
    for (int i = 0; i<CALIBARAION_SAMPLE_TIMES; i++) 
    {
        val += MQResistanceCalculation(analogRead(_pin));
        delay(CALIBRATION_SAMPLE_INTERVAL);
    }

    val = val / CALIBARAION_SAMPLE_TIMES;  //calculate the average value

    val = val / RO_CLEAN_AIR_FACTOR;       //divided by RO_CLEAN_AIR_FACTOR yields the Ro 
                                           //according to the chart in the datasheet 
    return val;
}

//
// MQRead
//
float GasSensor::MQRead() 
{
    int i    = 0;
    float rs = 0;
    int val  = analogRead(_pin);

    for (i = 0; i<READ_SAMPLE_TIMES; i++) 
    {
        rs += MQResistanceCalculation(val);
        delay(READ_SAMPLE_INTERVAL);
    }

    rs = rs / READ_SAMPLE_TIMES;
    return rs;
}

//
// MQGetGasPercentage
//
float GasSensor::MQGetGasPercentage(float rs_ro_ratio, int gas_id) 
{
    if (gas_id == GAS_LPG) 
    {
        return MQGetPercentage(rs_ro_ratio, LPGCurve);
    }
    else if (gas_id == GAS_CO) 
    {
        return MQGetPercentage(rs_ro_ratio, COCurve);
    }
    else if (gas_id == GAS_SMOKE) 
    {
        return MQGetPercentage(rs_ro_ratio, SmokeCurve);
    }

    return 0;
}

//
// MQGetPercentage
//
int GasSensor::MQGetPercentage(float rs_ro_ratio, float *pcurve) 
{
    return (pow(10, (((log(rs_ro_ratio) - pcurve[1]) / pcurve[2]) + pcurve[0])));
}
