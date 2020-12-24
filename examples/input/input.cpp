#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>

#define BTN_D2 2
#define LED_L 13

int main(void) {
    int lastState = 0;
    int inputState = 0;

    Serial.begin(9600);

    // Waits serial initialization
    _delay_ms(100);

    // Set ports
    pinMode(LED_L, OUTPUT);
    pinMode(BTN_D2, INPUT);

    sei();

    Serial.write("Click the D2 button...\n");

    while (1) {
        // Set input
        inputState = digitalRead(BTN_D2);

        // Checks last state
        if (lastState != inputState) {
            // Set last state
            lastState = inputState;

            // Set output
            digitalWrite(LED_L, inputState);

            // Write on serial output
            Serial.print("LED L: \t");
            Serial.println(inputState ? -1 : 1);
        }
    }
}
