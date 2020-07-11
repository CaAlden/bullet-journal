import * as iots from 'io-ts';
import { DateCodec } from './date';
import { JSONCodec } from './json';
import { Option, fold } from 'fp-ts/lib/Option';

interface INote {
  id: string;
  note: string;
  title: string | undefined;
  date: Date;
}

export const NoteCodec: iots.Type<INote, string, string> = JSONCodec.pipe(iots.type({
  id: iots.string,
  note: iots.string,
  title: iots.union([iots.string, iots.undefined]),
  date: DateCodec,
}));

export type NoteType = iots.TypeOf<typeof NoteCodec>;
