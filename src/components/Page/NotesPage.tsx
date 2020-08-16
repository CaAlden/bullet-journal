import React, { FC, useState } from 'react';
import { IPage } from '../../io/page';
import { Id, useStorage } from '../../io/db';
import { usePage } from '.';
import DragList from '../DragDrop/DragList';
import { EditEntry, AddEntry } from '../Entry';
import { EntryTypes, EntryType, EntryStates, EntryCodec } from '../../io/entry';
import { useStyle } from '../useStyles';
import { v4 } from 'uuid';
import { useOnEnter } from '../../utils';
import { IO } from 'fp-ts/lib/IO';
import { useExistentTrackedValue } from '../../io/useTrackedValue';
import { Card, CardContent, CardActions, TextField } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Button } from '../Button';
import { useColors } from '../../Colors';

interface INewNoteProps {
  pageId: Id;
  onNew: (e: EntryType) => void;
}

const getNote = (description: string): EntryType => ({
  type: EntryTypes.Note,
  id: v4(),
  date: new Date(),
  description,
  priority: false,
  state: EntryStates.ToDo,
});

const AddNoteEntry: FC<INewNoteProps> = ({ pageId, onNew }) => {
  const [value, setValue] = useState('');
  const onCreate = () => {
    onNew(getNote(value.trim()));
    setValue('');
  };

  const ref = useOnEnter(onCreate);
  return (
    <Card>
      <CardContent>
        <TextField
          fullWidth
          multiline
          label="New Note"
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
      </CardContent>
    </Card>
  );
};

interface INoteProps {
  id: Id,
  removeEntry: IO<void>;
}

const EditNote: FC<INoteProps> = ({ id, removeEntry }) => {
  const colors = useColors();
  const entry = useExistentTrackedValue({ id, type: EntryCodec });
  const storage = useStorage();
  const setDescription = (description: string) => {
    storage.serialize({ ...entry, description }, EntryCodec)();
  };

  return entry.type === EntryTypes.Note ? (
    <Card style={{ flexGrow: 1, minHeight: '200px', minWidth: '400px' }}>
      <CardActions>
        <Button hoverColor={colors.white} hoverBackground={colors.orange} onClick={removeEntry}>
          <CloseIcon style={{ width: '20px', height: '20px' }}/>
        </Button>
      </CardActions>
      <CardContent>
        <TextField
          multiline
          fullWidth
          value={entry.description}
          InputProps={{ disableUnderline: true }}
          onChange={e => setDescription(e.target.value)}
        />
      </CardContent>
    </Card>
  ) : null;
};

interface IProps {
  pageId: Id;
}

const NotesPage: FC<IProps> = ({ pageId }) => {
  const { page, addEntry, setTasks, removeEntry } = usePage(pageId);
  const editableEntries = page.tasks.map(id => ({
    id,
    element: <EditNote id={id} removeEntry={removeEntry(id)} />,
  }));

  const containerClassName = useStyle({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
  });

  return (
    <div className={containerClassName}>
      {page.tasks.map(id => <EditNote key={id} id={id} removeEntry={removeEntry(id)} />)}
      <AddNoteEntry key="newEntry" pageId={pageId} onNew={e => {
        const addIO = addEntry(e);
        // Immediately perform the IO.
        addIO();
      }} />
    </div>
  );
};

export default NotesPage;
