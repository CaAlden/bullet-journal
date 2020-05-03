import React, { useRef, useEffect, useCallback } from 'react';
import { useStyle } from '../useStyles';
import { EntryTypes } from '../../io/entry';

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
  const className = useStyle({
    border: 'none',
    textDecoration: crossed ? 'line-through' : 'none',
    background: 'inherit',
    flexGrow: 1,
    padding: '0 0.5em',
    outline: 'none',
    font: 'inherit',
  });

  const nodeRef = useRef<HTMLElement>(null);
  const listenerRef = useRef((e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEnter();
    }
  });
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current && nodeRef.current) {
      nodeRef.current.removeEventListener('keydown', listenerRef.current);
      listenerRef.current = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          onEnter();
        }
      };
      nodeRef.current.addEventListener('keydown', listenerRef.current);
    }
  }, [onEnter]);

  const callback = (node: HTMLElement | null) => {
    if (node === null) {
      if (nodeRef.current && isMounted.current) {
        nodeRef.current.removeEventListener('keydown', listenerRef.current);
        nodeRef.current = null;
      }
    } else if (isMounted.current) {
      if (nodeRef.current) {
        nodeRef.current.removeEventListener('keydown', listenerRef.current);
      }
      nodeRef.current = node;
      nodeRef.current.addEventListener('keydown', listenerRef.current);
    }
  };
  const placeholder = type === EntryTypes.Task ? "Add a task" :
    type === EntryTypes.Note ? 'Write a note' : 'Enter an event';

  return (
    <input
      ref={callback}
      className={className}
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder={placeholder}
    />
  );
};

export default Description;
