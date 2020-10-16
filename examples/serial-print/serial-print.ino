/*
  Uses a for loop to print numbers in various formats
*/
void setup() {
  Serial.begin(9600); // Open the serial port at 9600 bps:
}

void loop() {
  // Print labels
  Serial.print("NO FORMAT");  // Prints a label
  Serial.print("\t");         // Prints a tab

  Serial.print("DEC");
  Serial.print("\t");

  Serial.print("HEX");
  Serial.print("\t");

  Serial.print("OCT");
  Serial.print("\t");

  Serial.print("BIN");
  Serial.println();        // Carriage return after the last label

  // Only part of the ASCII chart, change to suit
  for (int x = 0; x < 64; x++) {
    // Print it out in many formats:
    Serial.print(x);       // Print as an ASCII-encoded decimal - same as "DEC"
    Serial.print("\t\t");  // Prints two tabs to accomodate the label lenght

    Serial.print(x, DEC);  // Print as an ASCII-encoded decimal
    Serial.print("\t");    // Prints a tab

    Serial.print(x, HEX);  // Print as an ASCII-encoded hexadecimal
    Serial.print("\t");    // Prints a tab

    Serial.print(x, OCT);  // Print as an ASCII-encoded octal
    Serial.print("\t");    // Prints a tab

    Serial.println(x, BIN); // Print as an ASCII-encoded binary

    // Then adds the carriage return with "println"
    delay(500);            // Delay 500 milliseconds
  }

  Serial.println();        // Prints another carriage return
}
