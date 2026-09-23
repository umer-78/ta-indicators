# ta-indicators

[![CI](https://github.com/umer-78/ta-indicators/actions/workflows/ci.yml/badge.svg)](https://github.com/umer-78/ta-indicators/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

Small, dependency-free **technical analysis indicators** for TypeScript and
JavaScript — the kind you drop into a trading dashboard, backtest or bot.

- Every function returns an array **the same length as its input**, with
  `null` where there is not enough history, so results line up with candles
  and chart directly
- O(n) implementations with running sums, no repeated window scans
- Strict TypeScript with `noUncheckedIndexedAccess`
- Checked against published reference values (Wilder's RSI example) and
  hand-computed cases

## Indicators

| Function | What it is |
|---|---|
| `sma(values, period)` | Simple moving average |
| `ema(values, period)` | Exponential moving average (SMA-seeded) |
| `wilder(values, period)` | Wilder's smoothing |
| `rsi(closes, 14)` | Relative Strength Index |
| `macd(closes, 12, 26, 9)` | MACD line, signal, histogram |
| `stochastic(candles, 14, 3, 3)` | Stochastic %K / %D |
| `bollinger(closes, 20, 2)` | Bands, bandwidth, %B |
| `atr(candles, 14)` / `trueRange(candles)` | Average True Range |
| `obv(candles)` | On-Balance Volume |
| `vwap(candles, period?)` | Cumulative or rolling VWAP |
| `crossovers(a, b \| level)` | `'above'` / `'below'` cross points |
| `last(series)` | Latest non-null value |

## Usage

```ts
import { rsi, macd, bollinger, crossovers, last } from '@umer-78/ta-indicators';

const closes = [44.34, 44.09, 44.15, /* … */ 43.13];

last(rsi(closes, 14));                // 37.79
const { macd: line, signal } = macd(closes);
const crosses = crossovers(line, signal); // [null, …, 'above', …]
const bands = bollinger(closes, 20);
last(bands.upper);                     // 47.620
```

Two runnable examples:

```bash
npm run example:offline   # 220 bundled sample candles, no network needed
npm run example           # live BTC/USDT daily candles from Binance's public API
```

```text
$ npm run example:offline
Bars               220
Last close         127.66
SMA(50)            134.24
RSI(14)            41.9
MACD histogram     0.081
Last MACD cross    above 0 bars ago
Bollinger %B       0.35
Stochastic %K/%D   30.8 / 28.2
ATR(14)            2.20
VWAP(20)           129.39
OBV                10273
```

`examples/sample-candles.json` is synthetic data generated with a fixed seed, so the
numbers above are reproducible.

## Install from source

```bash
git clone https://github.com/umer-78/ta-indicators.git
cd ta-indicators
npm ci
npm run build        # outputs ESM + .d.ts to dist/
```

## Develop

```bash
npm run typecheck
npm test             # vitest
```

## Notes

- Inputs are assumed to be clean numbers in time order. Remove gaps and `NaN`s first.
- RSI follows Wilder's method. At full precision the first values of his example
  are 70.46 and 66.25. The widely reproduced table shows 70.53 and 66.32 because it rounds
  intermediate averages. The two converge (37.79 at the end).
- Indicators describe past prices. They are not trading advice.

## License

[MIT](LICENSE)
