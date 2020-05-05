import React, { useState, useCallback, ReactNode } from 'react';
import { v4 } from 'uuid';
import { EntryCodec, EntryType, EntryTypes, EntryStates } from '../../io/entry';
import Priority from './Priority';
import Description from './Description';
import StateSelector from './StateSelector';
import { useStyles } from '../useStyles';
import { Id, useStorage, DBObserver } from '../../io/db';
import { useTrackedValue, useExistentTrackedValue } from '../../io/useTrackedValue';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold, Option } from 'fp-ts/lib/Option';
import { useColors } from '../../Colors';
import { useHovered } from '../../utils';

const getNewEntry = (): EntryType => {
  return ({
    id: v4(),
    type: EntryTypes.Task,
    state: EntryStates.ToDo,
    date: new Date(Date.now()),
    description: '',
    priority: false,
  });
};

interface IProps {
  onNew: (entry: EntryType) => void;
  remove?: ReactNode;
}

interface IConnected extends EntryType {
  setType: (type: EntryTypes) => void;
  setDesc: (str: string) => void;
  setState: (status: EntryStates) => void;
  setPriority: (p: boolean) => void;
  setDate: (date: Date) => void;
  onEnter: () => void;
  quickButtons?: ReactNode;
}

const Entry: React.FC<IConnected> = ({
  id,
  priority,
  setPriority,
  state,
  setState,
  type,
  setType,
  description,
  setDesc,
  onEnter,
  setDate,
  date,
  quickButtons,
}) => {
  const classes = useStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '1.5em',
      background: state === EntryStates.ToDo ? 'inherit' : '#ddd',
      fontWeight: priority ? 700 : 'normal',
      height: '50px',
      padding: '5px',
    },
    date: {
      fontSize: '0.75em',
      padding: '0 10px',
    }
  });
  const dateValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return (
    <div className={classes.container}>
      <Priority value={priority} setValue={setPriority}/>
      <StateSelector state={state} setState={setState} type={type} setType={setType} />
      <Description
        crossed={state === EntryStates.Dropped}
        value={description}
        type={type}
        setValue={setDesc}
        onEnter={onEnter}
      />
      {type === EntryTypes.Event ?
        <input type="date" value={dateValue} onChange={e => setDate(new Date(e.target.valueAsNumber))} /> :
        <span className={classes.date}>{date.toLocaleDateString()}</span>
      }
      {quickButtons && quickButtons}
    </div>
  );
};

export const AddEntry: React.FC<IProps> = ({ onNew }) => {
  const [id, setId] = useState(v4());
  const [type, setType] = useState(EntryTypes.Task);
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState(EntryStates.ToDo);
  const [priority, setPriority] = useState(false);
  const [date, setDate] = useState(new Date(Date.now()));
  const resetValues = () => {
    const defaults = getNewEntry();
    setId(defaults.id);
    setType(defaults.type);
    setDesc(defaults.description);
    setStatus(defaults.state);
    setPriority(defaults.priority);
    setDate(defaults.date);
  };
  return (
    <Entry
      id={id}
      type={type}
      setType={setType}
      state={status}
      setState={setStatus}
      description={desc}
      setDesc={setDesc}
      priority={priority}
      setPriority={setPriority}
      date={date}
      setDate={setDate}
      onEnter={() => {
        onNew({
          id,
          type,
          description: desc,
          state: status,
          priority,
          date,
        });
        resetValues();
      }}
    />
  );
};

const getAndDo = <T, R>(oT: Option<T>, f: (t: T) => R): R => {
  return pipe(
    oT,
    fold(
      () => {
        throw new Error('Could not get value');
      },
      (t) => {
        return f(t);
      }
    ),
  );
};

const makeFieldSetter = <K extends keyof EntryType>(db: DBObserver, field: K, entry: EntryType) => {
  return (val: EntryType[K]) => {
    const newE = {
      ...entry,
      [field]: val,
    }
    db.serialize(newE, EntryCodec)();
  };
};

const ButtonBase = {
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  background: 'inherit',
  margin: '0',
  minHeight: '30px',
  minWidth: '30px',
  maxHeight: '30px',
  maxWidth: '30px',
  marginRight: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '100%',
} as const;

export const EditEntry: React.FC<{ id: Id, remove: () => void; showCompleted: boolean }> = ({
  id,
  showCompleted,
  remove,
}) => {
  const colors = useColors();
  const [hovered, ref] = useHovered();
  const classes = useStyles({
    remove: {
      ...ButtonBase,
      ':hover': {
        background: colors.orange,
        color: colors.white,
      },
    },
    complete: {
      ...ButtonBase,
      fontSize: '0.8em',
      ':hover': {
        background: colors.green,
        color: colors.white,
      },
    },
    quickButtons: {
      width: hovered ? '70px' : '0px',
      overflow: 'hidden',
      transition: 'width 300ms ease-in-out',
      display: 'flex',
      justifyContent: 'space-around',
    },
  });
  const entry = useExistentTrackedValue({ id, type: EntryCodec });
  const storage = useStorage();
  const setState = makeFieldSetter(storage, 'state', entry);
  const quickButtons = (
    <div className={classes.quickButtons}>
      {entry.state !== EntryStates.Completed &&
        <button className={classes.complete} onClick={() => setState(EntryStates.Completed)}>✓</button>
      }
      <button className={classes.remove} onClick={remove}>X</button>
    </div>
  );

  return !showCompleted && entry.state === EntryStates.Completed ? null : (
    <div ref={ref}>
      <Entry
        {...entry}
        setType={makeFieldSetter(storage, 'type', entry)}
        setState={setState}
        setDesc={makeFieldSetter(storage, 'description', entry)}
        setPriority={makeFieldSetter(storage, 'priority', entry)}
        setDate={makeFieldSetter(storage, 'date', entry)}
        onEnter={() => {}}
        quickButtons={quickButtons}
      />
    </div>
  );
};
