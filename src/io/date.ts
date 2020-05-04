import * as iots from 'io-ts';

export const DateCodec = iots.string.pipe(new iots.Type<Date, string, string>(
  'DateCodec',
  (x: unknown): x is Date => x instanceof Date,
  (v, c) => {
    const attempt = Date.parse(v);
    if (Number.isNaN(attempt)) {
      return iots.failure(v, c);
    } else {
      return iots.success(new Date(attempt));
    }
  },
  (d) => d.toISOString(),
));

