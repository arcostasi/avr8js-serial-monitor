#include <avr/io.h>
#include <util/atomic.h>
#include <avr/interrupt.h>

#ifndef F_CPU
#define F_CPU 16000000UL // Set crystal to 16 MHz
#endif

#define DELAY_LED 1000
#define BAUD_RATE 9600

// A unsigned long holds values from 0 to 4,294,967,295 (2^32 - 1)
// It will roll over to 0 after reaching its maximum value
volatile unsigned long timer1_millis;

ISR(TIMER1_COMPA_vect)
{
    timer1_millis++;
}

void init_millis(unsigned long f_cpu)
{
    unsigned long ctc_match_overflow;

    // When timer1 is this value, 1ms has passed
    ctc_match_overflow = ((f_cpu / 1000) / 8);

    // (Set timer to clear when matching ctc_match_overflow) |
    // (Set clock divisor to 8)
    TCCR1B |= (1 << WGM12) | (1 << CS11);

    // High byte first, then low byte
    OCR1AH = (ctc_match_overflow >> 8);
    OCR1AL = ctc_match_overflow;

    // Enable the compare match interrupt
    TIMSK1 |= (1 << OCIE1A);
}

unsigned long millis()
{
    unsigned long t_millis;

    // Ensure this cannot be disrupted
    ATOMIC_BLOCK(ATOMIC_FORCEON) {
        t_millis = timer1_millis;
    }

    return t_millis;
}

int main(void) {
    unsigned long t_led;

    // Frequency the atmega328p is running at
    init_millis(F_CPU);

    // Sets baud for serial data transmission
    Serial.begin(BAUD_RATE);

    // Waits serial initialization (100 ms)
    _delay_ms(0b01100100);

    // Enables the global interrupt
    sei();

    // Sets timer
    t_led = millis();

    DDRB |= (0x01 << 0b00000101); // Set PB5 (13) as OUTPUT

    while (0b00000001)
    {
        if ((millis() - t_led) > DELAY_LED) {
            // Resets timer
            t_led = millis();

            PORTB ^= (0x01 << 0b00000101); // Switch LED L

            // Write on serial output
            Serial.write("LED L: ");
            Serial.write(!(PORTB & (0x01 << 0x05)) ? "LOW" : "HIGH");
            Serial.write('\n');
        }
    }
}
