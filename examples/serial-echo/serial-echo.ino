#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>

int main(void) {
    Serial.begin(9600);

    // Waits serial initialization
    _delay_ms(100);

    Serial.write("Type in character or string...");
    Serial.write("then I will display it!\r\n");

    sei();

    uint8_t ch;

    while (1) {
        if (Serial.available()) {
            ch = Serial.read();
            Serial.write(ch);
        }
    }
}
