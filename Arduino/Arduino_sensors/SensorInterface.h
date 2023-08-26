#pragma once

class ISensor{
    public:
    virtual void Begin() = 0;
    virtual float* Read(bool print = false) = 0;
    virtual bool ReadPIR(bool print = false) = 0;
};