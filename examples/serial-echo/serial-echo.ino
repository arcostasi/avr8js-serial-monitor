#include <stdio.h>
#include <avr/io.h>
#include "util/delay.h"  // Delay library

#ifndef F_CPU
#define F_CPU 16000000UL // Set crystal to 16 MHz
#endif

#define BAUDRATE 9600
#define UBRR (F_CPU / (BAUDRATE << 4)) - 1

// Calc prescaler (datasheet formula)
#define PRESCALER (((F_CPU / (BAUDRATE * 16UL))) - 1)

uint8_t rec_u;

void USART_init()
{
    // UBRR0H first 4 bits are don't care (0 for future compability)
    // next 4 bits are the 4 msb of the prescaler baud
    // UBRR0L is the 8 lsb of the prescaler baud
    UBRR0H = (unsigned char) (PRESCALER >> 8);
    UBRR0L = (unsigned char) PRESCALER;

    // The only non default values for 8N1,9600 are TX/RX enable
    UCSR0A &= 0xFD;

    // Enable the transmitter and receiver
    // UCSR0B |= (1 << RXEN0) | (1 << TXEN0);
    UCSR0B |= 0x18;
}

void USART_write(unsigned char data)
{
    // Wait for transmit buffer to be empty
    while (!(UCSR0A & (1 << UDRE0)));

    // Load data into transmit register
    UDR0 = data;
}

void USART_putstring(char* StringPtr)
{
    // Transmit character until NULL is reached
    while (*StringPtr != 0x00)
    {
        USART_write(*StringPtr);
        StringPtr++;
    }
}

char USART_getc()
{
    // Wait for data
    while(!(UCSR0A & (1 << RXC0)));

    // Return data
    return UDR0;
}

void USART_getLine(char* buf, uint8_t n)
{
    uint8_t bufIdx = 0;
    char c;

    // While received character is not carriage return
    // and end of buffer has not been reached
    do
    {
        // Receive character
        c = USART_getc();

        // Store character in buffer
        buf[bufIdx++] = c;
    }
    while((bufIdx < n) && (c != '\n'));

    // Ensure buffer is null terminated
    buf[bufIdx] = 0;
}

int main()
{
    // Setup USART
    USART_init();
    _delay_ms(200);
    USART_putstring("Ready");

    while (1)
    {
        // Allocate buffer
        uint8_t bufSize = 64;
        char buf[bufSize];

        // Get line from USART
        USART_getLine(buf, bufSize);

        // Echo input
        USART_putstring("You entered: ");
        USART_putstring(buf);
        USART_write('\n');
    }

    return 0;
}
