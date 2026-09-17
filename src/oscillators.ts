import type { Candle, Series } from './types.js';
import { ema, sma, wilder } from './moving.js';

/** Relative Strength Index (Wilder). 100 when there were no losses in the window. */
export function rsi(closes: readonly number[], period = 14): Series {
  const out: Series = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;
  const gains = [0];
  const losses = [0];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i]! - closes[i - 1]!;
    gains.push(Math.max(d, 0));
    losses.push(Math.max(-d, 0));
  }
  const g = wilder(gains, period, 1);
  const l = wilder(losses, period, 1);
  for (let i = period; i < closes.length; i++) {
    const avgGain = g[i]!;
    const avgLoss = l[i]!;
    out[i] = avgLoss === 0 ? (avgGain === 0 ? 50 : 100) : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export interface MacdResult {
  macd: Series;
  signal: Series;
  histogram: Series;
}

/** MACD line = EMA(fast) − EMA(slow); signal = EMA(signal) of the MACD line. */
export function macd(closes: readonly number[], fast = 12, slow = 26, signalPeriod = 9): MacdResult {
  if (fast >= slow) throw new RangeError('fast period must be shorter than slow period');
  const f = ema(closes, fast);
  const s = ema(closes, slow);
  const line: Series = closes.map((_, i) => (f[i] == null || s[i] == null ? null : f[i]! - s[i]!));
  const firstIdx = line.findIndex((v) => v !== null);
  const signal: Series = new Array(closes.length).fill(null);
  if (firstIdx >= 0) {
    const compact = ema(line.slice(firstIdx) as number[], signalPeriod);
    compact.forEach((v, j) => { signal[firstIdx + j] = v; });
  }
  const histogram: Series = line.map((v, i) => (v == null || signal[i] == null ? null : v - signal[i]!));
  return { macd: line, signal, histogram };
}

export interface StochasticResult {
  k: Series;
  d: Series;
}

/** Stochastic oscillator %K (smoothed) and %D. */
export function stochastic(candles: readonly Candle[], period = 14, smoothK = 3, smoothD = 3): StochasticResult {
  const raw: Series = candles.map((_, i) => {
    if (i < period - 1) return null;
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      hi = Math.max(hi, candles[j]!.high);
      lo = Math.min(lo, candles[j]!.low);
    }
    return hi === lo ? 50 : ((candles[i]!.close - lo) / (hi - lo)) * 100;
  });
  const smooth = (series: Series, n: number): Series => {
    const start = series.findIndex((v) => v !== null);
    const out: Series = new Array(series.length).fill(null);
    if (start < 0) return out;
    sma(series.slice(start) as number[], n).forEach((v, j) => { out[start + j] = v; });
    return out;
  };
  const k = smooth(raw, smoothK);
  return { k, d: smooth(k, smoothD) };
}
