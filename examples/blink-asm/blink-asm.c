/*
 * Blink an LED "L" every 250 ms, using assembly routines.
 *
 * The hex file is already in the folder,
 * just click on run to simulate.
 *
 * If you want to compile the code, use your arduino platform,
 * the server does not support assembly files.
 *
 * For more details see in:
 * http://forum.arduino.cc/index.php?topic=159572#msg1194604
 */

extern "C" {
    // Function prototypes
    void start();
    void blink();
}

int main(void)
{
    start();

    while (true)
    {
        blink();
    }

    return 0;
}
