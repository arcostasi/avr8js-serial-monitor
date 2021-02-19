// https://github.com/ZRandomize/ArduinoIOStream/
#include <Arduino.h>

class stream
{
    friend stream &endl(stream &ost);
  private:
    String reader(int blocks);
    bool blocker(int blocks, char chr);
  public:
    HardwareSerial *fu;
    stream(HardwareSerial *f);
    stream &operator<<(stream & (*op)(stream &));
    const stream &operator<<(const char *str);
    const stream &operator<<(const String &str);
    const stream &operator<<(const int &num);
    const stream &operator<<(const char &chr);
    const stream &operator<<(const float &num);
    const stream &operator<<(const byte &b);

    const stream &operator>>(String &str);
    const stream &operator>>(int &str);
    const stream &operator>>(char &chr);
    const stream &operator>>(float &flt);
    const stream &operator>>(byte &b);
};

stream &endl(stream &ost);
