import * as iots from 'io-ts';

export const JSONCodec = new iots.Type<object, string, string>(
  'JSONCodec',
  (x): x is object => x !== null && typeof x === 'object',
  (v, c) => {
    return iots.success(JSON.parse(v));
  },
  (c) => JSON.stringify(c),
);

