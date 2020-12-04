/*
 * Blink an LED "L" every 250 ms, using assembly routines.
 *
 * For more details see in:
 * http://forum.arduino.cc/index.php?topic=159572#msg1194604
 *
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │ Take a look at blink.S │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

extern "C" {
    // Function prototypes
    void start();
    void blink();
}

int main(void)
{
    // This routine (declared above as an external)
    start();

    while (true)
    {
        // This routine (declared above as an external)
        blink();
    }

    return 0;
}
