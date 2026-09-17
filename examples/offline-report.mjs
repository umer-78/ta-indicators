// Runs with no network: reads examples/sample-candles.json and prints a report.
//   npm run build && node examples/offline-report.mjs
import { readFileSync } from 'node:fs';
import { atr, bollinger, crossovers, last, macd, obv, rsi, sma, stochastic, vwap } from '../dist/index.js';

const candles = JSON.parse(readFileSync(new URL('./sample-candles.json', import.meta.url)));
const closes = candles.map((c) => c.close);
const m = macd(closes);
const b = bollinger(closes, 20);
const s = stochastic(candles);
const crosses = crossovers(m.macd, m.signal);
const lastCross = [...crosses].reverse().findIndex((c) => c !== null);

const rows = [
  ['Bars', candles.length],
  ['Last close', last(closes).toFixed(2)],
  ['SMA(50)', last(sma(closes, 50)).toFixed(2)],
  ['RSI(14)', last(rsi(closes)).toFixed(1)],
  ['MACD histogram', last(m.histogram).toFixed(3)],
  ['Last MACD cross', lastCross < 0 ? 'none' : `${crosses[crosses.length - 1 - lastCross]} ${lastCross} bars ago`],
  ['Bollinger %B', last(b.percentB).toFixed(2)],
  ['Bollinger width', last(b.bandwidth).toFixed(3)],
  ['Stochastic %K/%D', `${last(s.k).toFixed(1)} / ${last(s.d).toFixed(1)}`],
  ['ATR(14)', last(atr(candles)).toFixed(2)],
  ['VWAP(20)', last(vwap(candles, 20)).toFixed(2)],
  ['OBV', last(obv(candles)).toFixed(0)],
];
for (const [k, v] of rows) console.log(k.padEnd(18), v);
console.log('\nSynthetic data. Indicators describe the past; they are not trading advice.');
