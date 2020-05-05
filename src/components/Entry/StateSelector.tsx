import React, { useState, useCallback, useEffect, useRef, ReactNode, useMemo } from 'react';
import { EntryStates, EntryTypes } from '../../io/entry';
import { useStyle, useStyles } from '../useStyles';
import { useHovered } from '../../utils';
import { useColors } from '../../Colors';

interface IProps {
  state: EntryStates;
  setState: (state: EntryStates) => void;
  type: EntryTypes;
  setType: (type: EntryTypes) => void;
}

const Center: React.FC = ({ children }) => {
  const style = useStyle({
    paddingBottom: '4px',
    lineHeight: 0,
  });

  return (
    <span className={style}>{children}</span>
  );
};

const Symbols: { [K in EntryTypes | EntryStates]: ReactNode } = {
  [EntryTypes.Task]: <Center>●</Center>,
  [EntryTypes.Note]: <Center>—</Center>,
  [EntryTypes.Event]: <Center>▲</Center>,
  [EntryStates.Pushed]: <Center>{'<'}</Center>,
  [EntryStates.Migrated]: <Center>{'>'}</Center>,
  [EntryStates.Dropped]: '~',
  [EntryStates.Completed]: <Center>x</Center>,
  [EntryStates.ToDo]: <Center>#</Center>,
};

const ButtonStyles = {
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  background: 'inherit',
  font: 'inherit',
  margin: '0',
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
  });
  return <button onClick={() => setState(state)} className={className}>{children}</button>;
};

const types = [
  EntryTypes.Task,
  EntryTypes.Note,
  EntryTypes.Event,
];
const states = [
  EntryStates.ToDo,
  EntryStates.Completed,
  EntryStates.Migrated,
  EntryStates.Pushed,
  EntryStates.Dropped,
];

const isType = (x: unknown): x is EntryTypes => {
  return x === EntryTypes.Task || x === EntryTypes.Event || x === EntryTypes.Note;
}

const StateSelector: React.FC<IProps> = ({
  type,
  setType,
  state,
  setState,
}) => {
  const colors = useColors();
  const styles = useStyles({
    container: {
      display: 'flex',
      margin: '0 5px',
      width: '30px',
      height: '50px',
      alignItems: 'center',
      overflow: 'hidden',
      transition: 'width 300ms ease-in-out',
      ':hover': {
        width: `calc(34px * ${states.length + types.length})`,
      },
    },
    option: {
      ...ButtonStyles,
      minHeight: '30px',
      minWidth: '30px',
      maxHeight: '30px',
      maxWidth: '30px',
      marginRight: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '100%',
      ':hover': {
        background: '#e2e2e2e2'
      }
    },
  });

  const selected = state === EntryStates.ToDo ? type : state;
  const [hovered, ref] = useHovered();
  const options = useMemo(() => {
    const rest = [...types, ...states].filter(op => op !== selected)
    return [
      selected,
      ...rest,
    ];
  }, [selected]);
  return (
    <div className={styles.container} ref={ref}>
      {options.map(op => {
        const isSelected = op === type || op === state;
        return (
          <button
            key={op}
            className={styles.option}
            onClick={() => isType(op) ? setType(op) : setState(op)}
            style={{
              opacity: isSelected ? 1 : 0.7,
              cursor: isSelected ? 'no-drop' : 'pointer',
              background: isSelected && hovered ? colors.orange : undefined,
              color: !hovered && isSelected && op === EntryTypes.Note ? colors.darkgreen : 'inherit',
            }}
          >
            {Symbols[op]}
          </button>
        );
      })}
    </div>
  );
};

export default StateSelector;
