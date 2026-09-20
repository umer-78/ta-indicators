import type { Candle, Series } from './types.js';
import { rollingStd, sma, wilder } from './moving.js';

function assertPeriod(period: number): void {
  if (!Number.isInteger(period) || period < 1) {
    throw new RangeError(`period must be a positive integer, got ${period}`);
  }
}

export interface BollingerResult {
  upper: Series;
  middle: Series;
  lower: Series;
  /** (upper − lower) / middle */
  bandwidth: Series;
  /** where the close sits between the bands: 0 = lower, 1 = upper */
  percentB: Series;
}

export function bollinger(closes: readonly number[], period = 20, mult = 2): BollingerResult {
  assertPeriod(period);
  const middle = sma(closes, period);
  const sd = rollingStd(closes, period);
  const upper: Series = middle.map((m, i) => (m == null ? null : m + mult * sd[i]!));
  const lower: Series = middle.map((m, i) => (m == null ? null : m - mult * sd[i]!));
  const bandwidth: Series = middle.map((m, i) => (m == null || m === 0 ? null : (upper[i]! - lower[i]!) / m));
  const percentB: Series = middle.map((m, i) => {
    if (m == null) return null;
    const w = upper[i]! - lower[i]!;
    return w === 0 ? 0.5 : (closes[i]! - lower[i]!) / w;
  });
  return { upper, middle, lower, bandwidth, percentB };
}

export function trueRange(candles: readonly Candle[]): number[] {
  return candles.map((c, i) => {
    if (i === 0) return c.high - c.low;
    const prevClose = candles[i - 1]!.close;
    return Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose));
  });
}

/** Average True Range (Wilder). */
export function atr(candles: readonly Candle[], period = 14): Series {
  assertPeriod(period);
  return wilder(trueRange(candles), period);
}
