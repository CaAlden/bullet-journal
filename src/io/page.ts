import * as iots from 'io-ts';
import { DateCodec } from './date';
import { JSONCodec } from './json';
import { Id } from './db';

export enum PageType {
  Default = 'default',
  Notes = 'notes',
  Calendar = 'calendar',
}

export interface IPage {
  id: Id;
  name: string;
  type: PageType;
  start: Date;
  end: Date;
  tasks: Id[];
}

const PageTypes: {[K in PageType]: null} = {
  [PageType.Default]: null,
  [PageType.Notes]: null,
  [PageType.Calendar]: null,
};
const PageTypeCodec = iots.keyof(PageTypes);

export const PageCodec: iots.Type<IPage, string, string> = JSONCodec.pipe(iots.type({
  id: iots.string,
  name: iots.string,
  type: iots.union([PageTypeCodec, iots.undefined]),
  start: DateCodec,
  end: DateCodec,
  tasks: iots.array(iots.string),
}), 'Page');
