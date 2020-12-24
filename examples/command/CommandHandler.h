#ifndef COMMAND_HANDLER_H
#define COMMAND_HANDLER_H

#define COMMAND_HANDLER_VERSION "1.0.1"

#include <Arduino.h>

class CommandOption {
  public:

    inline CommandOption(const char* command,
                         bool (*callback)(const char*, Stream&, const CommandOption&),
                         bool partialMatch = true)
      : _command(command), _partialMatch(partialMatch), _callback(callback) {
      ;
    };

    inline const char* getCommand(void) const {
      return _command;
    };

    inline bool callback(const char* s, Stream &stream) const {
      if (_callback != nullptr)
        return _callback(s, stream, *this);
      else
        return false;
    };

    inline bool acceptPartialMatch(void) const {
      return _partialMatch;
    }

  private:
    const char* _command;
    bool (*_callback)(const char*, Stream &, const CommandOption&);
    bool _partialMatch;
};


class CommandHandler {
  public:
    static bool startsWith(const char *match, const char *str, char **ep);
    // static bool startsWith_P(const char *match, const char *str, char **ep);

    inline CommandHandler(void) :
      _buffer(NULL),
      _bufferLength(0),
      _options(NULL),
      _optionsLength(0),
      _unknownCommandCallback(NULL),
      _commandTooLongCallback(NULL),
      _ptr(NULL) {
      ;
    };

    void begin(char *buffer, int bufferLength, CommandOption *options, int optionsLength, void (*unknownCommandCallback)(const char*, Stream&) = NULL, void (*commandTooLongCallback)(Stream&) = NULL);
    bool process(Stream &stream);
    void resetBuffer();

  private:
    char *_buffer;
    int _bufferLength;
    CommandOption *_options;
    int _optionsLength;
    void (*_unknownCommandCallback)(const char*, Stream&);
    void (*_commandTooLongCallback)(Stream&);
    char *_ptr;
};

#endif
