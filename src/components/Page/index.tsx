import React, { useState } from 'react';
import { EditEntry, AddEntry } from '../Entry';
import { useStorage, Id } from '../../io/db';
import { PageCodec } from '../../io/page';
import { useTrackedValue, useExistentTrackedValue } from '../../io/useTrackedValue';
import { EntryType, EntryCodec } from '../../io/entry';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Option';
import { useStyles } from '../useStyles';
import { chain } from 'fp-ts/lib/IO';

const usePage = (id: Id) => {
  const storage = useStorage();
  const page = useExistentTrackedValue({ id, type: PageCodec })
  const addEntry = (entry: EntryType) => {
    return pipe(
      storage.serialize(entry, EntryCodec),
      chain(() => {
        const nextPage = {
          ...page,
          tasks: [...page.tasks, entry.id],
        };
        return storage.serialize(nextPage, PageCodec);
      }),
    );
  };

  const setName = (name: string) => {
    storage.serialize({
      ...page,
      name,
    }, PageCodec)();
  };

  const removeEntry = (id: Id) => {
    storage.removeItem(id);
    const nextPage = {
      ...page,
      tasks: page.tasks.filter(test => test !== id),
    };
    return storage.serialize(nextPage, PageCodec);
  }
  return ({
    page,
    setName,
    addEntry,
    removeEntry,
  });
};

const Page: React.FC<{ id: Id }> = ({
  id,
}) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const {
    page,
    removeEntry,
    addEntry,
    setName,
  } = usePage(id);
  const classes = useStyles({
    main: {
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
    },
    header: {
      boxSizing: 'border-box',
      borderBottom: '1px solid black',
      fontWeight: 'bold',
      padding: '0px 0px 15px 0px',
      margin: '0px 0px 15px 0px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      outline: 'none',
      background: 'inherit',
      border: 'none',
      fontSize: '2em',
      fontFamily: 'Permanent Marker',
    },
    label: {
      padding: '0 5px',
    },
  });

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <input className={classes.name} value={page.name} onChange={e => setName(e.target.value)}/>
        <div>
          <label className={classes.label}>Show Completed</label>
          <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} />
        </div>
      </div>
      {page.tasks.map((id) =>
        <EditEntry id={id} key={id} remove={removeEntry(id)} showCompleted={showCompleted}/>
      )}
      <AddEntry onNew={e => {
        const addIO = addEntry(e);
        // Immediately perform the IO.
        addIO();
      }} />
    </div>
  );
};

export default Page;
