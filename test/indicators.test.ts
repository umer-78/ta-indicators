import { describe, expect, it } from 'vitest';
import { atr, bollinger, crossovers, ema, last, macd, obv, rsi, sma, stochastic, vwap, type Candle } from '../src/index.js';

const close = (xs: number[]): number[] => xs;
const candle = (close: number, i: number, spread = 1, volume = 100): Candle => ({
  time: i, open: close, high: close + spread, low: close - spread, close, volume,
});

// Reference closes from Wilder's original RSI example (as reproduced by StockCharts).
const WILDER = close([
  44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28,
  46.0, 46.03, 46.41, 46.22, 45.64, 46.21, 46.25, 45.71, 46.45, 45.78, 45.35, 44.03, 44.18, 44.22, 44.57,
  43.42, 42.66, 43.13,
]);

describe('moving averages', () => {
  it('sma', () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
    expect(sma([1, 2], 3)).toEqual([null, null]);
  });
  it('ema seeds with the sma and weights recent values', () => {
    const e = ema([1, 2, 3, 4, 5, 6], 3);
    expect(e.slice(0, 2)).toEqual([null, null]);
    expect(e[2]).toBe(2);
    expect(e[3]).toBeCloseTo(3);
    expect(e[5]).toBeCloseTo(5);
  });
  it('rejects bad periods', () => {
    expect(() => sma([1], 0)).toThrow(RangeError);
    expect(() => ema([1], 1.5)).toThrow(RangeError);
  });
});

describe('rsi', () => {
  it('matches the Wilder example', () => {
    const r = rsi(WILDER, 14);
    expect(r[13]).toBeNull();
    // The published table rounds its intermediate averages (70.53, 66.32);
    // at full precision the first values are 70.46 and 66.25, and by the end
    // the two agree on 37.79.
    expect(r[14]).toBeCloseTo(70.46, 2);
    expect(r[15]).toBeCloseTo(66.25, 2);
    expect(r[32]).toBeCloseTo(37.79, 2);
  });
  it('is 100 on a straight rise and 50 on a flat line', () => {
    expect(last(rsi(Array.from({ length: 30 }, (_, i) => i), 14))).toBe(100);
    expect(last(rsi(Array.from({ length: 30 }, () => 5), 14))).toBe(50);
  });
});

describe('macd', () => {
  const closes = Array.from({ length: 80 }, (_, i) => 100 + Math.sin(i / 6) * 10);
  const m = macd(closes);
  it('lines up with the input and starts at the right bar', () => {
    expect(m.macd).toHaveLength(80);
    expect(m.macd[24]).toBeNull();
    expect(m.macd[25]).not.toBeNull();
    expect(m.signal[32]).toBeNull();
    expect(m.signal[33]).not.toBeNull();
  });
  it('histogram = macd - signal', () => {
    expect(m.histogram[50]).toBeCloseTo(m.macd[50]! - m.signal[50]!);
  });
  it('validates periods', () => expect(() => macd(closes, 26, 12)).toThrow());
});

describe('volatility', () => {
  it('bollinger bands collapse on a flat series', () => {
    const b = bollinger(Array(25).fill(10), 20);
    expect(b.upper[24]).toBe(10);
    expect(b.lower[24]).toBe(10);
    expect(b.percentB[24]).toBe(0.5);
  });
  it('bollinger width matches 2 standard deviations', () => {
    const b = bollinger([2, 4, 4, 4, 5, 5, 7, 9], 8, 2);
    expect(b.middle[7]).toBe(5);
    expect(b.upper[7]).toBe(9); // population std of this set is 2
    expect(b.lower[7]).toBe(1);
  });
  it('atr uses gaps between bars', () => {
    const candles = [candle(10, 0), candle(20, 1), candle(20, 2)];
    const a = atr(candles, 3);
    // true ranges: 2, max(2, |21-10|, |19-10|) = 11, 2
    expect(a[2]).toBeCloseTo(5);
  });
});

describe('volume and oscillators', () => {
  const candles = [10, 11, 11, 9, 12].map((c, i) => candle(c, i, 1, 10 * (i + 1)));
  it('obv adds on up closes and subtracts on down closes', () => {
    expect(obv(candles)).toEqual([0, 20, 20, -20, 30]);
  });
  it('vwap cumulative and rolling', () => {
    const v = vwap(candles);
    expect(v[0]).toBe(10);
    const rolling = vwap(candles, 2);
    expect(rolling[0]).toBeNull();
    expect(rolling[4]).toBeCloseTo((9 * 40 + 12 * 50) / 90);
  });
  it('stochastic is 100 at the top of the range', () => {
    const up = Array.from({ length: 20 }, (_, i) => candle(i, i, 0));
    const s = stochastic(up, 5, 1, 1);
    expect(last(s.k)).toBe(100);
    expect(last(s.d)).toBe(100);
  });
});

describe('crossovers', () => {
  it('finds crosses of a series and of a constant level', () => {
    expect(crossovers([1, 2, 3, 2, 1], [2, 2, 2, 2, 2])).toEqual([null, null, 'above', null, 'below']);
    expect(crossovers([25, 35, 28], 30)).toEqual([null, 'above', 'below']);
    expect(crossovers([null, 1, 3], 2)).toEqual([null, null, 'above']);
    expect(crossovers([1, null, 3], 2)).toEqual([null, null, null]);
  });
});
