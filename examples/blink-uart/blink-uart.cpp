#include <avr/io.h>
#include "util/delay.h"  // Delay library

#ifndef F_CPU
#define F_CPU 16000000UL // Set crystal to 16 MHz
#endif

#define BAUDRATE 9600
#define UBRR (F_CPU / (BAUDRATE << 4)) - 1

// Calc prescaler (datasheet formula)
#define BAUD_PRESCALE (((F_CPU / (BAUDRATE * 16UL))) - 1)

void uart_init() {
    // UBRR0H first 4 bits are don't care (0 for future compability)
    // next 4 bits are the 4 msb of the prescaler baud
    // UBRR0L is the 8 lsb of the prescaler baud
    UBRR0H = (unsigned char) (BAUD_PRESCALE >> 8);
    UBRR0L = (unsigned char) BAUD_PRESCALE;

    // The only non default values for 8N1,9600 are TX/RX enable
    UCSR0A &= 0xFD;
    UCSR0B |= 0x18;
}

void uart_write(unsigned char data) {
    // Wait for transmit buffer to be empty
    while (!(UCSR0A & (1 << UDRE0)));

    // Load data into transmit register
    UDR0 = data;
}

void uart_puts(char* strPtr) {
    // Transmit character until NULL is reached
    while (*strPtr != 0x00)
    {
        uart_write(*strPtr);
        strPtr++;
    }
}

int main(void)
{
    uart_init();

    // Waits USART initialization
    _delay_ms(100);

    DDRB |= (1 << DDB5); // Set PB5 (13) as OUTPUT

    while (1)
    {
        PORTB |= (1 << PORTB5);  // LED L on

        uart_puts("LED L: HIGH\n");
        _delay_ms(500);

        PORTB &= ~(1 << PORTB5); // LED L off

        uart_puts("LED L: LOW\n");
        _delay_ms(500);
    }
}
