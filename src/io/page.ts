import * as iots from 'io-ts';
import { DateCodec } from './date';
import { JSONCodec } from './json';
import { Id } from './db';

export interface IPage {
  id: Id;
  name: string;
  start: Date;
  end: Date;
  tasks: Id[];
}

export const PageCodec: iots.Type<IPage, string, string> = JSONCodec.pipe(iots.interface({
  id: iots.string,
  name: iots.string,
  start: DateCodec,
  end: DateCodec,
  tasks: iots.array(iots.string),
}));
