// Blink example using Inline Assembly
int main(void)
{
    asm volatile (
        "sbi %0, %1 \n\t"             // pinMode(13, OUTPUT);
        :: "I" (_SFR_IO_ADDR(DDRB)), "I" (DDB5)
    );

    while (1)
    {
        asm volatile (
            "sbi %0, %1 \n\t"          // turn LED on
            "call OneSecondDelay \n\t" // call delay ~1 second
            "cbi %0, %1 \n\t"          // turn LED off
            "call OneSecondDelay \n\t" // call delay ~1 second
            "rjmp 4f \n\t"             // exit

            "OneSecondDelay: \n\t"
            "ldi r18, 0 \n\t"          // delay ~1 second
            "ldi r20, 0 \n\t"
            "ldi r21, 0 \n\t"

            "1: ldi r24, lo8(400) \n\t"
            "ldi r25, hi8(400) \n\t"
            "2: sbiw r24, 1 \n\t"      // 10x around this loop = 1ms
            "brne 2b \n\t"
            "inc r18 \n\t"
            "cpi r18, 10 \n\t"
            "brne 1b \n\t"

            "subi r20, 0xff \n\t"      // 1000 x 1ms = 1 second
            "sbci r21, 0xff \n\t"
            "ldi r24, hi8(1000) \n\t"
            "cpi r20, lo8(1000) \n\t"
            "cpc r21, r24 \n\t"
            "breq 3f \n\t"

            "ldi r18, 0 \n\t"
            "rjmp 1b \n\t"

            "3: \n\t"
            "ret \n\t"

            "4: \n\t"                     // exit

            :: "I" (_SFR_IO_ADDR(PORTB)), "I" (PORTB5)
            : "r18", "r20", "r21", "r24", "r25"
        );
    }
}
