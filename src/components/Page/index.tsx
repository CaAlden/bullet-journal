import React, { useState, useEffect } from 'react';
import Delete from '@material-ui/icons/Delete';
import { useStorage, Id } from '../../io/db';
import { PageCodec, PageType } from '../../io/page';
import { useTrackedValue, useExistentTrackedValue } from '../../io/useTrackedValue';
import { EntryType, EntryCodec, EntryTypes, EntryStates } from '../../io/entry';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Option';
import { useStyles } from '../useStyles';
import { chain } from 'fp-ts/lib/IO';
import { map, filter, rights, separate } from 'fp-ts/lib/Array';
import { fromOption, fromPredicate, left, right } from 'fp-ts/lib/Either';
import { Tooltip, Snackbar, Divider } from '@material-ui/core';
import { Button } from '../Button';
import { useColors } from '../../Colors';
import PageTemplateSelector from './PageTemplateSelector';
import DefaultPage from './DefaultPage';
import NotesPage from './NotesPage';

export const usePage = (id: Id) => {
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

  const removeCompleted = () => {
    pipe(
      page.tasks,
      map(tId => storage.deserialize({ id: tId, type: EntryCodec })()),
      map(fromOption(null)),
      rights,
      map(e => e.state === EntryStates.Completed ? left(e) : right(e)),
      separate,
      ({ left, right }) => {
        left.map(({ id: rId }) => storage.removeItem(rId)());
        storage.serialize({ ...page, tasks: right.map(e => e.id) }, PageCodec)();
      },
    );
  };

  const setTasks = (tasks: Id[]) => {
    storage.serialize({
      ...page,
      tasks,
    }, PageCodec)();
  }

  const setType = (type: PageType) => {
    storage.serialize({
      ...page,
      type,
    }, PageCodec)();
  }

  return ({
    page,
    setName,
    addEntry,
    removeEntry,
    removeCompleted,
    setTasks,
    setType,
  });
};

const Page: React.FC<{ id: Id }> = ({
  id,
}) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const {
    page,
    removeCompleted,
    setName,
    setType,
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
      flexGrow: 1,
    },
    label: {
      padding: '0 5px',
    },
    actions: {
      display: 'grid',
      gridTemplateColumns: '1fr 30px min-content min-content',
      gap: '10px',
    },
  });

  const colors = useColors();
  const [showDeleted, setShowDeleted] = useState(false);
  const removeCompletedAction = () => {
    removeCompleted();
    setShowDeleted(true);
  };

  useEffect(() => {
    if (showDeleted) {
      const timeout = setTimeout(() => {
        setShowDeleted(false);
      }, 3000);
      return () => {
        clearTimeout(timeout);
      };
    }
  });

  const pageElm = page.type === PageType.Notes ? (
    <NotesPage pageId={id} />
  ) : <DefaultPage pageId={id} showCompleted={showCompleted} />;

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <input className={classes.name} value={page.name} onChange={e => setName(e.target.value)}/>
        <div className={classes.actions}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label className={classes.label}>Show Completed</label>
            <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} />
          </div>
          <Button onClick={removeCompletedAction} hoverBackground={colors.orange} hoverColor={colors.white}>
            <Tooltip title="Delete all completed entries">
              <Delete style={{ height: '20px', width: '20px', cursor: 'pointer' }} />
            </Tooltip>
          </Button>
          <Divider orientation="vertical" />
          <PageTemplateSelector type={page.type} setType={setType} />
        </div>
      </div>
      {pageElm}
      <Snackbar
        open={showDeleted}
        autoHideDuration={3000}
        onClose={() => setShowDeleted(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message="Completed entries were deleted!"
      />
    </div>
  );
};

export default Page;
