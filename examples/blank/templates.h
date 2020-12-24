#ifndef TEMPLATES_H
#define TEMPLATES_H

template <typename T> T printBin(T x, bool usePrefix = false)
{
  if (usePrefix)
    Serial.print("0b");

  for (int i = 0; i < 8 * sizeof(x); i++)
  {
    Serial.print(bitRead(x, sizeof(x) * 8 - i - 1));
  }

  Serial.println();
  return x;
}

#endif
