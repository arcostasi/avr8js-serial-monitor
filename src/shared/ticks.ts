export interface Tick {
  label: string;
  position: number;
}

const HALF_HOUR_MILLIS = 1000 * 60 * 30;

const roundToNearestModuloZero = (x: number, m: number): number => Math.round(x / m) * m;

const calculateIncrement = (min: number, max: number, noTicks: number): number => (max - min) / noTicks;

// Heuristic to calculate a good-looking and natural tick size
// Loosely based on the one used by Flotcharts
export const calculateTickSize = (min: number, max: number, noTicks: number): number => {
  const incr = calculateIncrement(min, max, noTicks);
  const digits = Math.floor(Math.log(incr) / Math.LN10);

  // Magnitude is the tenth power that most closely resembles
  // the range we are trying to express
  const magnitude = 10 ** digits;

  // How many magnitudes we have in the increment
  const norm = incr / magnitude;

  let size;
  // The closest divisor of 10 to norm
  if (norm < 1.5) {
    size = 1;
  } else if (norm < 3) {
    size = 2;
  } else if (norm < 7.5) {
    size = 5;
  } else {
    size = 10;
  }

  size *= magnitude;
  return size;
};

export const getDefaultYTicks = (min: number, max: number, n: number): Tick[] => {
  const tickSize = calculateTickSize(min, max, n);
  const decimalPlaces = Math.floor(Math.log10(tickSize));
  let tick = roundToNearestModuloZero(min, tickSize);
  const ticks = [tick];

  while (ticks[ticks.length - 1] < max) {
    tick += tickSize;
    ticks.push(tick);
  }

  return ticks.map(
    (t: number): Tick => ({ position: t, label: t.toFixed(2) })
  );
};

export const getTimeseriesXTicks = (
  min: number,
  max: number,
  everyMillis: number = HALF_HOUR_MILLIS,
  timeFormatter: (date: Date) => string = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`
  }
): Tick[] => {
  let tick = roundToNearestModuloZero(min, HALF_HOUR_MILLIS);
  const ticks = [tick];
  while (ticks[ticks.length - 1] < max) {
    tick += everyMillis;
    ticks.push(tick);
  }
  return ticks.map(
    (t: number): Tick => ({
      position: t,
      label: timeFormatter(new Date(t))
    })
  );
};
