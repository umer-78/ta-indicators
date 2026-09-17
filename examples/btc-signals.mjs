// Fetch recent BTC/USDT daily candles from Binance and print a few readings.
// Binance's public market-data API needs no key; it is blocked in some regions.
import { rsi, macd, bollinger, atr, last } from '../dist/index.js';

const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=200';
const res = await fetch(url);
if (!res.ok) throw new Error(`Binance answered ${res.status}. Try a VPN or the data-api.binance.vision mirror.`);
const candles = (await res.json()).map((k) => ({
  time: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5],
}));
const closes = candles.map((c) => c.close);
const m = macd(closes);
const b = bollinger(closes);
console.log(`BTC close      ${last(closes).toFixed(2)}`);
console.log(`RSI(14)        ${last(rsi(closes)).toFixed(1)}`);
console.log(`MACD hist      ${last(m.histogram).toFixed(2)}`);
console.log(`Bollinger %B   ${last(b.percentB).toFixed(2)}`);
console.log(`ATR(14)        ${last(atr(candles)).toFixed(2)}`);
console.log('\nIndicators describe the past. They are not financial advice.');
