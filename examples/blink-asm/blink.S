// Special Function Register for AVR, for better backward compatibility as
// used by avr-libc's register definitions (default value is 0x20)
#define __SFR_OFFSET 0x00

// If we use Arduino-style references (eg PORTB, DDRB etc) include this library
#include "avr/io.h"

// Make them accessible from the Arduino sketch so we can call them
.global start
.global blink

// A bit like main()
start:
    sbi   DDRB,5          ; Set PB5 (digital pin 13) as output
    ret                   ; Return to calling program

// A bit like a while()
blink:
  sbi   PORTB, 5          ; Set bit (make HIGH) PB5 (aka Digital Pin 13)
  ldi   r20, 10           ; How many 10mS do we want to delay
  rcall delay_10ms        ; Call the 10mS delay with R20 suitably set

  cbi   PORTB,5           ; Clear bit (make LOW) PB5 (aka Digital Pin 13)
  ldi   r20, 90           ; How many 10mS loops to run?
  rcall delay_10ms        ; Call the delay routine again
  // All done, return to calling program
  ret

  /***********************************************************************************
    Create a 10ms delay by executing a loop with an exact and known
    amount of time (clock cycles). Much easier (and accurate) when using a timer!
  ************************************************************************************/
  .equ  delayCnt, 39998   ; Inner loop value, to use the correct # of clock cycles

delay_10ms:

  ldi r30, lo8(delayCnt)  ; Load the LSB of delayCnt into register r30 [takes 1 clock cycle]
  ldi r31, hi8(delayCnt)  ; Load the MSB of delayCnt into register r31 [takes 1 clock cycle]

innerLoop:                ; We're going to count down from that fixed value to zero

  sbiw  r30, 1            ; Subtract 1 from the two-byte integer delayCnt (we must specify the LSB register) [2 cycles]
  brne  innerLoop         ; If it's not zero keep subtracting by looping round [2 cycles, just 1 if equal to zero]

  // Above code runs in (39,998 * 4) - 1 cycle = 159,991 clock cycles

  subi  r20, 1            ; Inner loop got to zero so now decrement (by 1) the outer loop counter [1 cycle]
  brne  delay_10ms        ; jump (branch) to main loop if not zero [2 cycles or just 1 if equal to 0]

  // At 16MHz outer loop code runs in: (loopCnt * 159,991) + 1 + 4 - 1 = 159,995 cycles

  nop                     ; Adds on a missing single cycle [1 cycle]
  ret                     ; Return to caller [4 cycles]

  // Now  we have the full 160,000 cycles for a 10mS delay. Errors creep in if we do the outer loop
  // more times eg for a tenth of a second (100ms) delay we must run this loop 10 times which uses
  // (10 * 159,991) +1 +4 -1 = 1,599,910 +1 +4 +1 = 1,599,914 clock cycles (we really need 1,600,000)
  // which is not 100ms (0.1 sec) but 99.994375ms (0.9999 sec), an error of 0.00245%.
  // Oh well, this just a demo.
