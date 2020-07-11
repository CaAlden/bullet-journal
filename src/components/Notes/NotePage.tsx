import React, { FC } from 'react';
import { useStorage } from '../../io/db';
import { useTrackedValue } from '../../io/useTrackedValue';
import * as iots from 'io-ts';
import { JSONCodec } from '../../io/json';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Option';
import { identity } from 'fp-ts/lib/function';
import { NoteType, NoteCodec } from '../../io/note';
import { chain } from 'fp-ts/lib/IO';
import NotePad from './NotePad';
import AddNoteButton from './AddNoteButton';

const NOTE_REGISTRY_KEY = '__note_registry';
const NoteRegistryCodec = JSONCodec.pipe(iots.type({
  id: iots.literal(NOTE_REGISTRY_KEY),
  notes: iots.array(iots.string),
}));
type NoteRegistry = iots.TypeOf<typeof NoteRegistryCodec>;

const useNotesController = () => {
  const storage = useStorage();
  const noteRegistry = useTrackedValue({ id: NOTE_REGISTRY_KEY, type: NoteRegistryCodec });
  const existantRegistry = pipe(
    noteRegistry,
    fold(
      () => {
        const initialValue: NoteRegistry = { id: NOTE_REGISTRY_KEY, notes: [] };
        storage.serialize(initialValue, NoteRegistryCodec)();
        return initialValue;
      },
      identity,
    ),
  );

  const addNote = (note: NoteType) => {
    const newNoteList = [...existantRegistry.notes, note.id];
    pipe(
      storage.serialize(note, NoteCodec),
      chain(() => storage.serialize({
        ...existantRegistry,
        notes: newNoteList,
      }, NoteRegistryCodec)),
    )();
  };

  const removeNote = (noteId: string) => {
    const filtered = {
      ...existantRegistry,
      notes: existantRegistry.notes.filter(id => id !== noteId),
    };
    pipe(
      storage.serialize(filtered, NoteRegistryCodec),
      chain(() => storage.removeItem(noteId)),
    )();
  }

  return {
    registry: existantRegistry,
    addNote,
    removeNote
  };
};

const Notes: FC = () => {
  const { registry, addNote, removeNote } = useNotesController();
  return (
    <div>
      {registry.notes.map((note) => <NotePad id={note} key={note} />)}
      <AddNoteButton addNote={addNote} />
    </div>
  );
};

export default Notes;
