import React, { useState, useCallback, useEffect, useRef, ReactNode, useMemo } from 'react';
import { EntryStates, EntryTypes } from '../../io/entry';
import { useStyle, useStyles } from '../useStyles';

interface IProps {
  state: EntryStates;
  setState: (state: EntryStates) => void;
  type: EntryTypes;
  setType: (type: EntryTypes) => void;
}

const useHovered = (): [boolean, (node: null | HTMLElement) => void] => {
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef<HTMLElement>(null);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    }
  }, []);

  const mouseOverRef = useRef(() => {
    if (isMounted.current) {
      setHovered(true);
    }
  });

  const mouseOutRef = useRef(() => {
    if (isMounted.current) {
      setHovered(false);
    }
  });

  const cbkRef = useCallback((node: null | HTMLElement) => {
    if (node === null) {
      if (isMounted.current && nodeRef.current) {
        nodeRef.current.removeEventListener('mouseover', mouseOverRef.current);
        nodeRef.current.removeEventListener('mouseout', mouseOutRef.current);
      }
    } else if (isMounted.current) {
      if (nodeRef.current) {
        nodeRef.current.removeEventListener('mouseover', mouseOverRef.current);
        nodeRef.current.removeEventListener('mouseout', mouseOutRef.current);
      }

      nodeRef.current = node;
      nodeRef.current.addEventListener('mouseover', mouseOverRef.current);
      nodeRef.current.addEventListener('mouseout', mouseOutRef.current);
    }
  }, []);

  return [hovered, cbkRef];
};

const getSymbol = (s: EntryStates, t: EntryTypes) => {
  if (s === EntryStates.ToDo) {
    switch (t) {
      case EntryTypes.Task: return '●';
      case EntryTypes.Note: return '—';
      case EntryTypes.Event: return '▲';
    }
  } else {
    switch (s) {
      case EntryStates.Pushed: return '<';
      case EntryStates.Migrated: return '>';
      case EntryStates.Dropped: return '~';
      case EntryStates.Completed: return 'x';
    }
  }
};

const ButtonStyles = {
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  background: 'inherit',
  font: 'inherit',
  margin: '0',
  ':hover': {
    background: '#e2e2e2',
  }
} as const;

const StateButton: React.FC<{
  state: EntryStates;
  setState: (state: EntryStates) => void;
}> = ({
  state,
  setState,
  children,
}) => {
  const className = useStyle({
    ...ButtonStyles
  });
  return <button onClick={() => setState(state)} className={className}>{children}</button>;
};

const AllTypes = [EntryTypes.Task, EntryTypes.Note, EntryTypes.Event];
const StateSelector: React.FC<IProps> = ({
  type,
  setType,
  state,
  setState,
}) => {
  const [index, setIndex] = useState(AllTypes.indexOf(type));
  const onClick = () => {
    if (state === EntryStates.ToDo) {
      setIndex(idx => (idx + 1) % AllTypes.length);
    } else {
      setState(EntryStates.ToDo);
    }
  };

  useEffect(() => {
    if (type !== AllTypes[index]) {
      if (state !== EntryStates.ToDo) {
        setState(EntryStates.ToDo);
      }
      setType(AllTypes[index]);
    }
  }, [index]);

  const [hovered, callbackRef] = useHovered();
  const classes = useStyles({
    state: {
      position: 'absolute',
      top: 'calc(100% + 3px)',
      background: 'white',
      overflow: 'hidden',
      height: hovered ? '140px' : '0px',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
    },
    main: {
      ...ButtonStyles,
    }
  });

  return (
    <div className={classes.container} ref={callbackRef}>
      <button className={classes.main} onClick={onClick}>{getSymbol(state, type)}</button>
      <div className={classes.state}>
        <StateButton state={EntryStates.Completed} setState={setState}>{getSymbol(EntryStates.Completed, type)}</StateButton>
        <StateButton state={EntryStates.Migrated} setState={setState}>{getSymbol(EntryStates.Migrated, type)}</StateButton>
        <StateButton state={EntryStates.Pushed} setState={setState}>{getSymbol(EntryStates.Pushed, type)}</StateButton>
        <StateButton state={EntryStates.Dropped} setState={setState}>{getSymbol(EntryStates.Dropped, type)}</StateButton>
      </div>
    </div>
  );
};

export default StateSelector;
