import { PinState } from 'avr8js';
import { buildHex } from "../shared/compile";
import { CPUPerformance } from '../shared/cpu-performance';
import { AVRRunner } from "../shared/execute";
import { formatTime } from "../shared/format-time";
import { EditorHistoryUtil } from '../shared/editor-history.util';
import { I2CBus } from "../shared/i2c-bus";
import { Point } from '../shared/geometry'
import { Color } from '../shared/graphics'
import { Plotter } from '../shared/plotter'

// Using CommonJS modules
import * as ed from './editor'
import * as fs from "fs";

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

const lLED = document.getElementById('l-led');
const txLED = document.getElementById('tx-led');

const analogA0 = document.querySelector<HTMLInputElement>('#analogA0');
analogA0.addEventListener('change', changeAnalogA0);

const inputD2 = document.querySelector<HTMLInputElement>('#input-d2');
inputD2.addEventListener('click', changeInputD2);

const inputD3 = document.querySelector<HTMLInputElement>('#input-d3');
inputD3.addEventListener('click', changeInputD3);

const inputD4 = document.querySelector<HTMLInputElement>('#input-d4');
inputD4.addEventListener('click', changeInputD4);

const canvas = document.querySelector<HTMLCanvasElement>('#canvas-plotter');

let labelA0 = document.querySelector<HTMLElement>('#labelA0');

const sampleSlider = document.querySelector<HTMLInputElement>('#sample-slider');
sampleSlider.addEventListener('change', changePlotterSamples);

let sampleLabel = document.querySelector<HTMLElement>('#sample-label');

// Set up toolbar
let runner: AVRRunner;
let board = 'uno';
let autoScroll = true;

let nBuffer = new Array<number>(32);
let nOffset = 0;

let plotter = new Plotter(canvas);

let aPoints = Array<Point>(512);
let dOffset = new Uint16Array(8);

let tabIndex = 0;
let getData = false;

let samplePlotter = 256;

function executeProgram(hex: string) {

  runner = new AVRRunner(hex);

  const cpuMillis = () => Math.round((runner.cpu.cycles / runner.frequency) * 1000);

  const cpuPerf = new CPUPerformance(runner.cpu, runner.frequency);

  const i2cBus = new I2CBus(runner.twi);

  let animation = true;
  let previousMillis = 0;

  // Set sample
  aPoints.length = samplePlotter;
  aPoints.fill({ x: 0, y: 0 });

  // Set offset
  for (let i = 0; i <= dOffset.length - 1; i++) {
    dOffset[i] = samplePlotter;
  }

  statusLabel.textContent = 'Simulation time: ';

  // Set analog A0
  runner.setAnalogValue(parseInt(analogA0.value));

  // Hook to PORTB register
  runner.portB.addListener((value) => {
    // Port B starts at pin 8 to 13
    lLED.style.visibility = value & 1 << 5 ? "visible" : "hidden";
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
    txLED.style.visibility = "visible";
    runnerOutputText.textContent += String.fromCharCode(value);

    // Checks auto scroll
    if (autoScroll) {
      runnerOutputText.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }

    // Check carriage return, line break and tab
    if ((value != 10) && (value != 13) && (value != 9)) {
      nBuffer[nOffset++] = value;
    }

    // Checks tab
    if (value == 9) {
      getData = true;
      tabIndex++;
    }

    // Checks line break
    if (value == 13) {
      getData = true;
      tabIndex = 1;
    }

    if (getData) {
      getData = false;
      plotData(cpuMillis());
    }

    if (animation) {
      animation = false;
      setTimeout(() => {
        txLED.style.visibility = "hidden";
        animation = true;
      }, 100);
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
    const millis = performance.now();

    statusLabelTimer.textContent = `${time}`;

    if ((millis - previousMillis) > 200) {
      // Update status
      previousMillis = millis;
      statusLabelSpeed.textContent = padLeft(speed, '0', 3) + '%';
    }
  });
}

async function compileAndRun() {

  storeUserSnippet();

  // Disable buttons
  compileButton.setAttribute('disabled', '1');
  runButton.setAttribute('disabled', '1');

  clearOutput();

  try {
    statusLabel.textContent = '    Compiling... ';
    statusLabelTimer.textContent = '00:00.000';
    statusLabelSpeed.textContent = '  0%';

    const result = await buildHex(ed.getEditor().getValue(),
      ed.getProjectFiles(), ed.getProjectBoard(), ed.getDebug());

    if (result.hex) {
      // Set project hex filename
      ed.setProjectHex(ed.getProjectPath(), ed.getProjectName('.hex'));

      // Save hex
      fs.writeFile(ed.getProjectHex(), result.hex, function(err) {
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
    runnerOutputText.textContent += err + "\n";
  } finally {
    compileButton.removeAttribute('disabled');
    runButton.removeAttribute('disabled');
  }
}

function storeUserSnippet() {
  EditorHistoryUtil.clearSnippet();
  EditorHistoryUtil.storeSnippet(ed.getEditor().getValue());
}

function onlyRun() {
  fs.readFile(ed.getProjectHex(), 'utf8', function(err, data) {
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

function plotData(tsecs: number) {
  let value = parseFloat(String.fromCharCode.apply(null, nBuffer));

  if (value != NaN) {
    // Shifts samples to the left
    if (dOffset[tabIndex - 1] >= aPoints.length) {
      dOffset[tabIndex - 1]--;
      aPoints.shift();
    }

    // Set values
    aPoints[dOffset[tabIndex - 1]] = {
      x: tsecs,
      y: value
    };

    let color: Color = Color.Green;

    if (tabIndex <= Object.keys(Color).length) {
      color = Object.values(Color)[tabIndex - 1];
    }

    // Set data
    plotter.plot(aPoints, [], 'auto', color);

    // Increment data offset
    dOffset[tabIndex - 1]++;
  }

  nBuffer.fill(0);
  nOffset = 0;
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
    ed.setProjectHex(file.path, '');
    runnerOutputText.textContent += "Load HEX: " + file.path + "\n";
  } else {
    runnerOutputText.textContent += "File not supported, .hex files only!\n";
  }
}

function printChars(value: string) {
  return [...value].map(char => char.charCodeAt(0));
}

function padLeft(text: string, padChar: string, size: number): string {
  return (String(padChar).repeat(size) + text).substr((size * -1), size);
}

function changeAnalogA0() {
  labelA0.textContent = "A0: " + analogA0.value;

  // Write analog value
  if (runner)
    runner.setAnalogValue(parseInt(analogA0.value));
}

function changePlotterSamples() {
  sampleLabel.textContent = "SAMPLES: " + sampleSlider.value;
  samplePlotter = parseInt(sampleSlider.value);

  // Resize arrays
  aPoints.length = samplePlotter;
  aPoints.fill({ x: 0, y: 0 });

  // Set offset
  for (let i = 0; i <= dOffset.length - 1; i++) {
    dOffset[i] = samplePlotter;
  }
}

// Port D starts at pin 0 to 7
function changeInputD2() {
  if (runner)
    runner.portD.setPin(2, inputD2.checked);
}

function changeInputD3() {
  if (runner)
    runner.portD.setPin(3, inputD3.checked);
}

function changeInputD4() {
  if (runner)
    runner.portD.setPin(4, inputD4.checked);
}
