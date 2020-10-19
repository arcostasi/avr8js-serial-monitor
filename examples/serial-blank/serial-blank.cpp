#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>

int main(void) {
    Serial.begin(9600);

    // Waits serial initialization
    _delay_ms(100);

    sei();

    while (1) {
        // Put your code here
    }
}
