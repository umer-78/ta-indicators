import type { Series } from './types.js';

export type Cross = 'above' | 'below' | null;

/** Where series `a` crosses series `b` (or a constant level). */
export function crossovers(a: Series, b: Series | number): Cross[] {
  const at = (s: Series | number, i: number) => (typeof s === 'number' ? s : s[i] ?? null);
  return a.map((v, i) => {
    if (i === 0) return null;
    const p = a[i - 1];
    const bv = at(b, i);
    const bp = at(b, i - 1);
    if (v == null || p == null || bv == null || bp == null) return null;
    if (p <= bp && v > bv) return 'above';
    if (p >= bp && v < bv) return 'below';
    return null;
  });
}

/** Latest non-null value of a series. */
export function last(series: Series): number | null {
  for (let i = series.length - 1; i >= 0; i--) if (series[i] != null) return series[i]!;
  return null;
}
