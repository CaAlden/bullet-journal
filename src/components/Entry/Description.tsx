import React, { useRef, useEffect, useCallback } from 'react';
import { useStyle } from '../useStyles';
import { EntryTypes } from '../../io/entry';
import { useColors } from '../../Colors';
import { useOnEnter } from '../../utils';

interface IProps {
  value: string;
  setValue: (str: string) => void;
  crossed: boolean;
  type: EntryTypes;
  onEnter: () => void;
}

const Description: React.FC<IProps> = ({
  value,
  setValue,
  type,
  crossed,
  onEnter,
}) => {
  const colors = useColors();
  const className = useStyle({
    border: 'none',
    color: type === EntryTypes.Note ? colors.darkgreen : colors.black,
    textDecoration: crossed ? 'line-through' : 'none',
    background: 'inherit',
    flexGrow: 1,
    margin: '0 5px',
    outline: 'none',
    font: 'inherit',
  });

  const callbackRef = useOnEnter(onEnter);
  const placeholder = type === EntryTypes.Task ? "Add a task" :
    type === EntryTypes.Note ? 'Write a note' :
    type === EntryTypes.Question ? 'Ask a question' : 'Enter an event';

  return (
    <input
      ref={callbackRef}
      className={className}
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder={placeholder}
    />
  );
};

export default Description;
