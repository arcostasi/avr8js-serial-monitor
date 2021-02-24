/**
 * AVRRunner
 * Part of AVR8js
 *
 * Copyright (C) 2019, Uri Shaked
 */
import {
  avrInstruction,
  avrInterrupt,
  AVRTimer,
  CPU,
  AVRIOPort,
  AVREEPROM,
  AVRUSART,
  AVRSPI,
  AVRTWI,
  AVRClock,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  usart0Config,
  spiConfig,
  twiConfig
} from 'avr8js';

import { loadHex } from './intelhex';
import { MicroTaskScheduler } from './task-scheduler';
import { EEPROMLocalStorageBackend } from './eeprom';
import { CPUPerformance } from '../shared/cpu-performance';

// ATmega328p params
const FLASH = 0x8000;

const rxLED = document.getElementById('rx-led');

export class AVRRunner {
  readonly program = new Uint16Array(FLASH);
  readonly cpu: CPU;
  readonly clock: AVRClock;
  readonly timer0: AVRTimer;
  readonly timer1: AVRTimer;
  readonly timer2: AVRTimer;
  readonly portB: AVRIOPort;
  readonly portC: AVRIOPort;
  readonly portD: AVRIOPort;
  readonly eeprom: AVREEPROM;
  readonly usart: AVRUSART;
  readonly spi: AVRSPI;
  readonly twi: AVRTWI;
  readonly frequency = 16e6; // 16 MHZ
  readonly taskScheduler = new MicroTaskScheduler();
  readonly performance: CPUPerformance;

  // Serial buffer
  private serialBuffer: any = [];

  // LED animation
  private animation: boolean = true;

  // Cycles
  private cyclesToRun: number;
  private workSyncCycles: number = 1;
  private workUnitCycles: number = 100000;
  private syncCycles: number = 1;

  constructor(hex: string) {
    // Load program
    loadHex(hex, new Uint8Array(this.program.buffer));

    // Check hex size
    if (hex.length > 2048) {
      // Fake RAM Size
      this.cpu = new CPU(this.program, FLASH);
    } else {
      // Arduino UNO (ATmega328)
      this.cpu = new CPU(this.program);
    }

    this.performance = new CPUPerformance(this.cpu, this.frequency);

    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);

    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);

    this.eeprom = new AVREEPROM(this.cpu, new EEPROMLocalStorageBackend());
    this.usart = new AVRUSART(this.cpu, usart0Config, this.frequency);
    this.usart.onRxComplete = () => this.flushSerialBuffer();
    this.spi = new AVRSPI(this.cpu, spiConfig, this.frequency);
    this.twi = new AVRTWI(this.cpu, twiConfig, this.frequency);

     // Analog read
    this.cpu.writeHooks[0x7a] = value => {
      if (value & (1 << 6)) {
        this.cpu.data[0x7a] = value & ~(1 << 6); // Clear bit - conversion done
        return true; // Don't update
      }
    };

    this.taskScheduler.start();
  }

  setAnalogValue(analogValue: number) {
    // Write analog value to ADCH and ADCL
    this.cpu.data[0x78] = analogValue & 0xff;
    this.cpu.data[0x79] = (analogValue >> 8) & 0x3;
  }

  // Function to send data to the serial port
  serialWrite(value: string) {
     rxLED.style.visibility = "visible";

    // Writing to UDR transmits the byte
    [...value].forEach(c => {
      // Write a character
      this.serialBuffer.push(c.charCodeAt(0));
    });

    this.flushSerialBuffer();

    if (this.animation) {
      this.animation = false;
      setTimeout(() => {
        rxLED.style.visibility = "hidden";
        this.animation = true;
      }, 100);
    }
  }

  private flushSerialBuffer() {
    if (!this.usart.rxBusy && this.serialBuffer.length) {
      this.usart.writeByte(this.serialBuffer.shift());
    }
  }

  setSyncCycles(factor: number) {
    this.syncCycles = factor;
  }

  getSyncCycles() {
    return this.syncCycles;
  }

  // CPU main loop
  execute(callback: (cpu: CPU) => void) {
    const speed = this.performance.update();

    // Execution throttling
    if (speed > 1.02) {
      this.workSyncCycles *= Math.ceil((1 / speed) * 100) / 100;
    } else {
      // Adjust gain to balance cycles
      this.workSyncCycles = this.getSyncCycles();
    }

    this.cyclesToRun = this.cpu.cycles + this.workUnitCycles * this.workSyncCycles;

    while (this.cpu.cycles < this.cyclesToRun) {
      // Instruction timing is currently based on ATmega328p
      avrInstruction(this.cpu);
      this.cpu.tick();
    }

    callback(this.cpu);

    this.taskScheduler.postTask(() => this.execute(callback));
  }

  stop() {
    this.taskScheduler.stop();
  }

  analogPort() {
    // Simulate analog port (so that analogRead() eventually return)
    this.cpu.writeHooks[0x7a] = value => {
      if (value & (1 << 6)) {
        // random value
        const analogValue = Math.floor(Math.random() * 1024);

        this.cpu.data[0x7a] = value & ~(1 << 6); // Clear bit - conversion done
        this.cpu.data[0x78] = analogValue & 0xff;
        this.cpu.data[0x79] = (analogValue >> 8) & 0x3;

        return true; // Don't update
      }
    }
  }

  roundFloatNumber(num: number, dp: number) {
    let numToFixedDp = Number(num).toFixed(dp);
    return Number(numToFixedDp);
  }
}
