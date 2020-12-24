#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>

int main(void) {
    int sensorPin = 0;    // Select the input pin for the potentiometer
    int sensorValue = 0;  // Variable to store the value coming from the sensor

    Serial.begin(9600);

    // Waits serial initialization
    _delay_ms(100);

    sei();

    while (1) {
        // Read the value from the sensor:
        sensorValue = analogRead(sensorPin);
        Serial.print("A0: \t");
        Serial.println(sensorValue);

        // The number of milliseconds between readings
        _delay_ms(1000);
    }
}
