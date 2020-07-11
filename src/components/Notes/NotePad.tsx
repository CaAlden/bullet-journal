import React, { FC } from 'react';
import { useExistentTrackedValue, makeFieldSetter } from '../../io/useTrackedValue';
import { NoteCodec, NoteType } from '../../io/note';
import { useStorage } from '../../io/db';
import { useStyle } from '../useStyles';

interface IProps {
  id: string;
}

const NoteInput: FC<{ setNote: (note: string) => void; note: string }> = ({ note, setNote }) => (
  <textarea onChange={(e) => setNote(e.target.value)} value={note} />
);

const NotePad: FC<IProps> = ({ id }) => {
  const noteValue = useExistentTrackedValue({ type: NoteCodec, id });
  const storage = useStorage();
  const setNote = makeFieldSetter(storage, 'note', noteValue, NoteCodec);

  const padContainerClass = useStyle({
    display: 'flex',
    flexDirection: 'column'
  });

  return (
    <div className={padContainerClass}>
      <NoteInput setNote={setNote} note={noteValue.note} />
    </div>
  );
};

export default NotePad;
