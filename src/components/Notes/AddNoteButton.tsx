import React, { FC } from 'react';
import { NoteType } from '../../io/note';
import { v4 } from 'uuid';

interface IProps {
  addNote: (note: NoteType) => void;
}

const getDefaultValue = (): NoteType => ({
  id: v4(),
  note: '',
  title: undefined,
  date: new Date(),
});

const AddNoteButton: FC<IProps> = ({ addNote }) => {
  return (
    <button type="button" onClick={() => addNote(getDefaultValue())}>Add a Note</button>
  );
};

export default AddNoteButton;
