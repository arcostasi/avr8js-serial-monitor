#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>

int main(void) {
    Serial.begin(9600);

    // Waits serial initialization
    _delay_ms(100);

    sei();

    DDRB |= (1 << DDB5); // Set PB5 (13) as OUTPUT

    while (1)
    {
        PORTB |= (1 << PORTB5);  // LED L on

        Serial.write("LED L: HIGH\n");
        _delay_ms(500);

        PORTB &= ~(1 << PORTB5); // LED L off

        Serial.write("LED L: LOW\n");
        _delay_ms(500);
    }
}
