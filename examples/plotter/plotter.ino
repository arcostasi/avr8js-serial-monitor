/*
 * Created by ArduinoGetStarted.com
 * This example code is in the public domain
 * Tutorial page:
 * https://arduinogetstarted.com/tutorials/arduino-serial-plotter
 */

void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 360; i += 5) {
    float y1 = 1 * sin(i * M_PI / 180);
    // float y2 = 2 * sin((i + 90) * M_PI / 180);
    // float y3 = 5 * sin((i + 180) * M_PI / 180);

    Serial.println(y1);

    // A space ' ' or  tab '\t' character is
    // printed between the two values
    // Serial.print("\t");
    // Serial.print(y2);

    // A space ' ' or  tab '\t' character is
    // printed between the two values
    // Serial.print("\t");

    // The last value is followed by a carriage
    // return and a newline characters
    // Serial.println(y3);
  }
}
