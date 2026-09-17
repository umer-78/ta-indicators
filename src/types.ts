/** One OHLCV bar. `time` is any increasing number (e.g. epoch ms). */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Every indicator returns an array the same length as its input.
 * Positions without enough history are `null`, so results line up with the
 * candles they belong to and can be charted directly.
 */
export type Series = (number | null)[];
