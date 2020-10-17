#include <avr/io.h>
#include "util/delay.h"  // Delay library

#ifndef F_CPU
#define F_CPU 16000000UL // Set crystal to 16 MHz
#endif

#define BAUDRATE 9600
#define UBRR (F_CPU / (BAUDRATE << 4)) - 1

// Calc prescaler (datasheet formula)
#define PRESCALER (((F_CPU / (BAUDRATE * 16UL))) - 1)

void USART_init() {
    // UBRR0H first 4 bits are don't care (0 for future compability)
    // next 4 bits are the 4 msb of the prescaler baud
    // UBRR0L is the 8 lsb of the prescaler baud
    UBRR0H = (unsigned char) (PRESCALER >> 8);
    UBRR0L = (unsigned char) PRESCALER;

    // The only non default values for 8N1,9600 are TX/RX enable
    UCSR0A &= 0xFD;
    UCSR0B |= 0x18;
}

void USART_write(unsigned char data) {
    // Wait for transmit buffer to be empty
    while (!(UCSR0A & (1 << UDRE0)));

    // Load data into transmit register
    UDR0 = data;
}

void USART_putstring(char* StringPtr) {
    // Transmit character until NULL is reached
    while (*StringPtr != 0x00)
    {
        USART_write(*StringPtr);
        StringPtr++;
    }
}

int main(void)
{
    USART_init();

    // Waits USART initialization
    _delay_ms(200);

    DDRB |= (1 << DDB5); // Set PB5 (13) as OUTPUT

    while (1)
    {
        PORTB |= (1 << PORTB5);  // LED L on

        USART_putstring("LED L: HIGH\n");
        _delay_ms(500);

        PORTB &= ~(1 << PORTB5); // LED L off

        USART_putstring("LED L: LOW\n");
        _delay_ms(500);
    }
}
