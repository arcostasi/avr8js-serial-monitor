/*
 * Demonstrate an AT command set interface using CommandHandler.
 * This implementation is similar to the AT command interface.
 */

#include "CommandHandler.h"

constexpr uint8_t maxCommandLength = 80;

// Commands
bool cmdPrintHelp(const char*, Stream&, const CommandOption&);
bool cmdAT(const char *, Stream&, const CommandOption&);
bool cmdGetVersion(const char *, Stream&, const CommandOption&);
bool cmdGetName(const char *, Stream&, const CommandOption&);
bool cmdSetName(const char *, Stream&, const CommandOption&);

void errorCommand(const char *s, Stream &stream);
void commandTooLong(Stream &stream);

CommandOption commands[] = {
  CommandOption("HELP", cmdPrintHelp, true),
  CommandOption("?", cmdPrintHelp, true),
  // "AT" matches the start of other commands. Since the partialMatch
  // parameter is set false the command can be placed at any point in the
  // array, otherwise it would need to be entered after other AT commands.
  CommandOption("AT", cmdAT, false),
  CommandOption("AT+GMR", cmdGetVersion, false),

  // There are several ways to implement get and set commands.
  // It is possible to use a single function and test the first character
  // after the match. Here we separate the get and set into two functions.
  CommandOption("AT+NAME=", cmdSetName, true),
  CommandOption("AT+NAME?", cmdGetName, false),
};

constexpr uint8_t numCommands = sizeof(commands) / sizeof(commands[0]);

CommandHandler serialHandler;

char serialCommandBuffer[maxCommandLength];

// Since the maximum command length cannot exceed maxCommandLength we know
// that the value for name can fit.
char name[maxCommandLength] = {'\0'};

void printHelp(Stream& stream)
{
  // Print some help information
  stream.println("+HELP  COMMAND HELP");
  stream.println("+HELP  ============");
  stream.println("+HELP ");
  stream.println("+HELP  Valid commands are:");
  stream.println("+HELP  AT                 Print OK (null command)");
  stream.println("+HELP ");
  stream.println("+HELP  AT+GMR             Print software version");
  stream.println("+HELP ");
  stream.println("+HELP  AT+NAME?           Return current value of NAME");
  stream.println("+HELP ");
  stream.println("+HELP  AT+NAME=value      Set NAME to given value");
}

bool cmdPrintHelp(const char* s, Stream& stream, const CommandOption&)
{
  // Ignore characters after the string match, any command
  // that starts with the correct sequence will print the help
  printHelp(stream);
  stream.println();
  stream.println("OK");

  return true;
}

bool cmdAT(const char* s, Stream& stream, const CommandOption&)
{
  if (s && *s == '\0') {
    // String is valid, no more characters after the AT part matched
    stream.println("OK");
  } else {
    stream.println("ERROR");
  }

  return true;
}

bool cmdGetVersion(const char* s, Stream& stream, const CommandOption&)
{
  if (s && *s == '\0') {
    // String is valid, no more characters after the AT+GMR part matched
    stream.println("+GMR:" COMMAND_HANDLER_VERSION);
    stream.println();
    stream.println("OK");
  } else {
    stream.println("ERROR");
  }

  return true;
}

bool cmdSetName(const char* s, Stream& stream, const CommandOption&)
{
  strncpy(name, s, sizeof(name)); // Copy everything after the match
  stream.println("+NAME:"); stream.println(name);
  stream.println();
  stream.println("OK" );

  return true;
}

bool cmdGetName(const char* s, Stream& stream, const CommandOption&)
{
  if (s && *s == '\0') {
    // String is valid, no unwanted extra characters after the match
    stream.print("+NAME:"); stream.println(name);
    stream.println();
    stream.println("OK");
  } else {
    stream.println("ERROR");
  }

  return true;
}

void errorCommand(const char *, Stream &stream)
{
  stream.println("ERROR");
}

void commandTooLong(Stream &stream)
{
  stream.println("ERROR");
}

void setup(void)
{
  Serial.begin(9600);

  serialHandler.begin(serialCommandBuffer, sizeof(serialCommandBuffer),
    commands, numCommands, errorCommand, commandTooLong);

  delay(200);

  // Print some help. No command was issued so don't send "OK"
  printHelp(Serial);
}

void loop(void)
{
  // Put your other commands here.

  // Have the command handler process any incoming data.
  // If a complete command is ready the matching
  // callback function will be called.
  serialHandler.process(Serial);
}
