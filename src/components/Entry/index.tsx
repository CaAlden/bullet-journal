import React, { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { v4 } from 'uuid';
import { EntryCodec, EntryType, EntryTypes, EntryStates } from '../../io/entry';
import Priority from './Priority';
import Description from './Description';
import StateSelector from './StateSelector';
import { useStyles } from '../useStyles';
import { Id, useStorage, DBObserver } from '../../io/db';
import { useTrackedValue, useExistentTrackedValue, makeFieldSetter } from '../../io/useTrackedValue';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold, Option } from 'fp-ts/lib/Option';
import { useColors } from '../../Colors';
import { useHovered } from '../../utils';
import { Button } from '../Button';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';

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
  pageId: Id;
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
      flexGrow: 1,
      alignItems: 'center',
      fontSize: '1.5em',
      background: state === EntryStates.Completed ? '#ddd' : 'inherit',
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

export const AddEntry: React.FC<IProps> = ({ onNew, pageId }) => {
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

  const oldPage = useRef(pageId);
  const doCreate = () => {
    // Only create new entries if they have a description
    if (desc !== '') {
      onNew({
        id,
        type,
        description: desc,
        state: status,
        priority,
        date,
      });
      resetValues();
    }
  };

  useEffect(() => {
    if (oldPage.current !== pageId) {
      oldPage.current = pageId;
      // Automatically create a task if someone navigates away.
      doCreate();
    }
  }, [pageId]);

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
      onEnter={doCreate}
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

export const EditEntry: React.FC<{ id: Id, remove: () => void; showCompleted: boolean }> = ({
  id,
  showCompleted,
  remove,
}) => {
  const colors = useColors();
  const [hovered, ref] = useHovered();
  const classes = useStyles({
    quickButtons: {
      width: hovered ? '70px' : '0px',
      overflow: 'hidden',
      transition: 'width 300ms ease-in-out',
      display: 'flex',
      justifyContent: 'space-around',
    },
    wrapper: {
      display: 'flex',
      flexGrow: 1,
    },
  });
  const entry = useExistentTrackedValue({ id, type: EntryCodec });
  const storage = useStorage();
  const setState = makeFieldSetter(storage, 'state', entry, EntryCodec);
  const quickButtons = (
    <div className={classes.quickButtons}>
      {entry.state !== EntryStates.Completed &&
        <Button
          hoverColor={colors.white}
          hoverBackground={colors.green}
          onClick={() => setState(EntryStates.Completed)}
          style={{
            fontSize: '0.8em',
          }}
        ><CheckIcon/></Button>
      }
      <Button hoverColor={colors.white} hoverBackground={colors.orange} onClick={remove}><ClearIcon /></Button>
    </div>
  );

  return !showCompleted && entry.state === EntryStates.Completed ? null : (
    <div ref={ref} className={classes.wrapper}>
      <Entry
        {...entry}
        setType={makeFieldSetter(storage, 'type', entry, EntryCodec)}
        setState={setState}
        setDesc={makeFieldSetter(storage, 'description', entry, EntryCodec)}
        setPriority={makeFieldSetter(storage, 'priority', entry, EntryCodec)}
        setDate={makeFieldSetter(storage, 'date', entry, EntryCodec)}
        onEnter={() => {}}
        quickButtons={quickButtons}
      />
    </div>
  );
};
