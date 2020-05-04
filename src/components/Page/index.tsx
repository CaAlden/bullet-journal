import React from 'react';
import { EditEntry, AddEntry } from '../Entry';
import { useStorage, Id } from '../../io/db';
import { PageCodec } from '../../io/page';
import { useTrackedValue, useExistentTrackedValue } from '../../io/useTrackedValue';
import { EntryType, EntryCodec } from '../../io/entry';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Option';
import { useStyle } from '../useStyles';
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
    addEntry,
    removeEntry,
  });
};

const Page: React.FC<{ id: Id }> = ({
  id,
}) => {
  const {
    page,
    removeEntry,
    addEntry,
  } = usePage(id);
  const appStyles = useStyle({
    padding: '10px',
  });

  console.log(id);
  console.log(page);
  return (
    <div className={appStyles}>
      <h1>{page.name}</h1>
      <hr />
      {page.tasks.map((id) =>
        <EditEntry id={id} key={id} remove={removeEntry(id)}/>
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
