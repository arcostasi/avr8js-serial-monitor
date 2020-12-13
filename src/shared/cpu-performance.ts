/**
 * CPU Performance
 * Part of AVR8js
 *
 * Copyright (C) 2019, Uri Shaked
 */
import { ICPU } from 'avr8js';

export class CPUPerformance {
  private prevTime = 0;
  private prevCycles = 0;
  private samples = new Float32Array(64);
  private sampleIndex = 0;
  private avg = 0
  private result = 0;
  private resultTime = 0;

  constructor(private cpu: ICPU, private MHZ: number) {}

  reset() {
    this.prevTime = 0;
    this.prevCycles = 0;
    this.sampleIndex = 0;
  }

  update() {

    if (this.prevTime) {
      const delta = performance.now() - this.prevTime;
      const deltaCycles = this.cpu.cycles - this.prevCycles;
      const deltaCpuMillis = 1000 * (deltaCycles / this.MHZ);
      const factor = deltaCpuMillis / delta;

      if (!this.sampleIndex) {
        this.samples.fill(factor);
      }

      this.samples[this.sampleIndex++ % this.samples.length] = factor;
    }

    this.prevCycles = this.cpu.cycles;
    this.prevTime = performance.now();
    this.avg = this.samples.reduce((x, y) => x + y) / this.samples.length;

    if ((this.prevTime - this.resultTime) > 100) {
      this.resultTime = this.prevTime;
      this.result = this.avg;
    }

    return this.result;
  }
}
