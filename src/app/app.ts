import { PinState } from 'avr8js';
import { buildHex } from "../shared/compile";
import { CPUPerformance } from '../shared/cpu-performance';
import { AVRRunner } from "../shared/execute";
import { formatTime } from "../shared/format-time";
import { EditorHistoryUtil } from '../shared/editor-history.util';
import { I2CBus } from "../shared/i2c-bus";
import { SMDLEDElement } from './smd-led-element';

import * as fs from "fs";

// Get Monaco Editor
declare function getEditor(): any;
declare function getProjectPath(): any;
declare function getProjectName(ext: any): any;
declare function getProjectHex(): any;
declare function setProjectHex(folder: any, fileHex: any): any;
declare function getProjectFiles(): any;
declare function getProjectBoard(): any;
declare function getComponents(): any;
declare function getDebug(): any;

// Add events to the buttons
const compileButton = document.querySelector("#compile-button");
compileButton.addEventListener("click", compileAndRun);

const runButton = document.querySelector("#run-button");
runButton.addEventListener("click", onlyRun);

const stopButton = document.querySelector("#stop-button");
stopButton.addEventListener("click", stopCode);

const clearButton = document.querySelector("#clear-button");
clearButton.addEventListener("click", clearOutput);

const loadHexButton = document.querySelector("#loadhex-button");
loadHexButton.addEventListener("click", loadHex);

const fileInput = document.querySelector<HTMLInputElement>('#file-input');
fileInput.addEventListener('change', changeFileInput);

const statusLabel = document.querySelector("#status-label");
const statusLabelTimer = document.querySelector("#status-label-timer");
const statusLabelSpeed = document.querySelector("#status-label-speed");
const runnerOutputText = document.querySelector<HTMLElement>('#runner-output-text');

const serialInput = document.querySelector<HTMLInputElement>('#serial-input');
serialInput.addEventListener("keypress", serialKeyPress);

const serialSend = document.querySelector('#serial-send');
serialSend.addEventListener("click", serialTransmit);

const serialScroll = document.querySelector<HTMLInputElement>('#serial-scroll');
serialScroll.addEventListener("click", serialAutoScroll);

const rxLED = document.getElementById('rx-led');

// Set up toolbar
let runner: AVRRunner;
let board = 'uno';
let autoScroll = true;

function executeProgram(hex: string) {

  runner = new AVRRunner(hex);

  const cpuNanos = () => Math.round((runner.cpu.cycles / runner.frequency) * 1000000000);
  const cpuMillis = () => Math.round((runner.cpu.cycles / runner.frequency) * 1000);

  const cpuPerf = new CPUPerformance(runner.cpu, runner.frequency);

  const i2cBus = new I2CBus(runner.twi);

  let animation = true;

  // Hook to PORTB register
  runner.portB.addListener((value) => {
    // Port B starts at pin 8 to 13
  });

  // Hook to PORTC register
  runner.portC.addListener((value) => {
    // Analog input pins (A0-A5)
  });

  // Hook to PORTD register
  runner.portD.addListener((value) => {
    // Port D starts at pin 0 to 7
  });

  // Connect to Serial port
  runner.usart.onByteTransmit = (value: number) => {
    rxLED.style.visibility = "visible";
    runnerOutputText.textContent += String.fromCharCode(value);

    // Checks auto scroll
    if (autoScroll) {
      runnerOutputText.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }

    if (animation) {
      animation = false;
      setTimeout(() => {
        rxLED.style.visibility = "hidden";
        animation = true;
      }, 50);
    }
  };

  // Connect to SPI
  runner.spi.onTransfer = (value: number) => {
    runnerOutputText.textContent += "SPI: 0x" + value.toString(16) + "\n";
    return value;
  };

  runner.execute((cpu) => {
    const time = formatTime(cpu.cycles / runner.frequency);
    const speed = (cpuPerf.update() * 100).toFixed(0);

    // Update status
    statusLabel.textContent = 'Simulation time: ';
    statusLabelTimer.textContent = `${time}`;
    statusLabelSpeed.textContent = `${speed}%`;
  });
}

async function compileAndRun() {

  storeUserSnippet();

  // Disable buttons
  compileButton.setAttribute('disabled', '1');
  runButton.setAttribute('disabled', '1');

  clearOutput();

  try {
    statusLabel.textContent = 'Compiling...';
    statusLabelTimer.textContent = '00:00.000';
    statusLabelSpeed.textContent = '0%';

    const result = await buildHex(getEditor().getValue(),
      getProjectFiles(), getProjectBoard(), getDebug());

    if (result.hex) {
      // Set project hex filename
      setProjectHex(getProjectPath(), getProjectName('.hex'));

      // Save hex
      fs.writeFile(getProjectHex(), result.hex, function (err) {
          if (err) return console.log(err)
      });

      stopButton.removeAttribute('disabled');

      executeProgram(result.hex);
    }

    // Check result error
    if (result.stderr != undefined || result.stdout != undefined) {
      runnerOutputText.textContent = result.stderr || result.stdout;
    }
  } catch (err) {
    compileButton.removeAttribute('disabled');
    runnerOutputText.textContent += err + "\n";
  } finally {
    statusLabel.textContent = '';
    runButton.removeAttribute('disabled');
  }
}

function storeUserSnippet() {
  EditorHistoryUtil.clearSnippet();
  EditorHistoryUtil.storeSnippet(getEditor().getValue());
}

function onlyRun() {
  fs.readFile(getProjectHex(), 'utf8', function(err, data) {
    if (err) {
      runnerOutputText.textContent += err + "\n";
    }

    if (data) {
      stopButton.removeAttribute('disabled');
      runButton.setAttribute('disabled', '1');

      executeProgram(data);
    }
  });
}

function stopCode() {
  stopButton.setAttribute('disabled', '1');
  compileButton.removeAttribute('disabled');
  runButton.removeAttribute('disabled');

  if (runner) {
    runner.stop();
    runner = null;

    statusLabel.textContent = 'Stop simulation: ';
  }
}

function serialKeyPress(event: any) {
  // Ckeck Enter
  if (event.charCode == 13) {
    serialTransmit();
  }
}

function serialTransmit() {
  // Serial transmit
  if (runner) {
    // Checks serial clear command
    if ((serialInput.value.toUpperCase() == "CLEAR") ||
        (serialInput.value.toUpperCase() == "CLS")) {
      serialInput.value = "";
      clearOutput();
      return;
    }

    runner.serialWrite(serialInput.value + "\r\n");
    serialInput.value = "";
  } else {
    runnerOutputText.textContent += "Warning: AVR is not running!\n";
  }
}

function serialAutoScroll() {
  autoScroll = serialScroll.checked;
}

function clearOutput() {
  runnerOutputText.textContent = '';
}

function loadHex() {
  fileInput.click();
}

function changeFileInput() {
  let file = fileInput.files[0];

  if (file.name.match(/\.(hex)$/)) {
    // Set project hex filename
    setProjectHex(file.path, '');
    runnerOutputText.textContent += "Load HEX: " + file.path + "\n";
  } else {
    runnerOutputText.textContent += "File not supported, .hex files only!\n";
  }
}

function printChars(value: string) {
  return [...value].map(char => char.charCodeAt(0));
}
