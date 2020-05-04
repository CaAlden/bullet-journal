import * as iots from 'io-ts';
import { DateCodec } from './date';
import { JSONCodec } from './json';

export enum EntryTypes {
  Task = 'task',
  Event = 'event',
  Note = 'note',
}

const EntryTypeCodec = iots.keyof({
  [EntryTypes.Task]: null,
  [EntryTypes.Event]: null,
  [EntryTypes.Note]: null,
});

export enum EntryStates {
  // The task is done
  Completed = 'completed',
  // The task is pending
  ToDo = 'todo',
  // The task was dropped
  Dropped = 'dropped',
  // The task was moved
  Migrated = 'migrated',
  // The task was pushed.
  Pushed = 'pushed',
}

const EntryStateCodec = iots.keyof({
  [EntryStates.Completed]: null,
  [EntryStates.ToDo]: null,
  [EntryStates.Dropped]: null,
  [EntryStates.Migrated]: null,
  [EntryStates.Pushed]: null,
});

interface IEntry {
  id: string;
  type: EntryTypes;
  description: string;
  priority: boolean;
  date: Date;
  state: EntryStates;
}

export const EntryCodec: iots.Type<IEntry, string, string> = JSONCodec.pipe(iots.interface({
  id: iots.string,
  type: EntryTypeCodec,
  description: iots.string,
  priority: iots.boolean,
  date: DateCodec,
  state: EntryStateCodec,
}));

export type EntryType = iots.TypeOf<typeof EntryCodec>;
