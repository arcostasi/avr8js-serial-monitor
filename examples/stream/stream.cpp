#include "SerialStream.h"

stream cout(&Serial);
stream cin(&Serial);

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sequence = 0;
  int a = 0, b = 1;
  int limit = 0;

  cout << "How many Fibonacci numbers ";
  cout << "do you want to generate?" << endl;
  cin >> limit;

  cout << a << ',';
  cout << b << ',';

  for (int n = 0; n < limit; n++)
  {
    sequence = (a + b);
    cout << sequence;
    if (n < limit - 1)
      cout << ',';
    a = b;
    b = sequence;
  }

  cin << endl;
}
