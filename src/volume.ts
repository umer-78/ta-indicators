import type { Candle, Series } from './types.js';

/** On-Balance Volume. */
export function obv(candles: readonly Candle[]): number[] {
  let total = 0;
  return candles.map((c, i) => {
    if (i > 0) {
      const prev = candles[i - 1]!.close;
      if (c.close > prev) total += c.volume;
      else if (c.close < prev) total -= c.volume;
    }
    return total;
  });
}

/**
 * Volume-weighted average price over a rolling window of `period` bars,
 * or cumulative from the first bar when `period` is omitted.
 */
export function vwap(candles: readonly Candle[], period?: number): Series {
  const out: Series = new Array(candles.length).fill(null);
  let pv = 0;
  let vol = 0;
  candles.forEach((c, i) => {
    const typical = (c.high + c.low + c.close) / 3;
    pv += typical * c.volume;
    vol += c.volume;
    if (period && i >= period) {
      const old = candles[i - period]!;
      pv -= ((old.high + old.low + old.close) / 3) * old.volume;
      vol -= old.volume;
    }
    if (!period || i >= period - 1) out[i] = vol > 0 ? pv / vol : null;
  });
  return out;
}
