// https://github.com/ZRandomize/ArduinoIOStream/
#include "SerialStream.h"

stream::stream(HardwareSerial *f)
{
  fu = f;
}

stream &stream::operator<<(stream & (*op)(stream &))
{
  return (*op)(*this);
}

const stream &stream::operator<<(const char *str)
{
  (*fu).print(str);
  return *this;
}

const stream &stream::operator<<(const String &str)
{
  (*fu).print(str);
  return *this;
}

const stream &stream::operator<<(const int &num)
{
  return (*this) << String(num);
}

const stream &stream::operator<<(const char &chr)
{
  return (*this) << String(chr);
}

const stream &stream::operator<<(const float &num)
{
  return (*this) << String(num);
}

const stream &stream::operator<<(const byte &b)
{
  (*fu).print("0x");
  (*fu).print(b, HEX);
  return *this;
}

stream &endl(stream &ost)
{
  ost << "\n";
  return ost;
}

String stream::reader(int blocks)
{
  String buf = "";
  char chr;
  while (!(*fu).available());
  delay(50);
  chr = (char)(*fu).read();
  while (blocker(blocks, chr))
  {
    buf += chr;
    if ((*fu).available())
    {
      chr = (char)(*fu).read();
    }
    else
    {
      break;
    }
  }
  return buf;
}

bool stream::blocker(int blocks, char chr)
{
  char ablocks[] = {'\n', ',', ' '};
  for (int i = 0; i < blocks; i++)
  {
    if (ablocks[i] == chr)
    {
      return false;
    }
  }
  return true;
}

const stream &stream::operator>>(String &str)
{
  str = reader(1);
  return *this;
}

const stream &stream::operator>>(int &str)
{
  str = reader(3).toInt();
  return *this;
}

const stream &stream::operator>>(float &flt)
{
  flt = reader(3).toFloat();
  return *this;
}

const stream &stream::operator>>(byte &b)
{
  while (!(*fu).available());
  b = (byte)(*fu).read();
  return *this;
}

const stream &stream::operator>>(char &chr)
{
  while (!(*fu).available());
  chr = (char)(*fu).read();
  return *this;
}
