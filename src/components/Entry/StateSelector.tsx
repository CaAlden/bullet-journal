import React, { useState, useCallback, useEffect, useRef, ReactNode, useMemo } from 'react';
import ChangeHistory from '@material-ui/icons/ChangeHistory';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import HelpIcon from '@material-ui/icons/Help';
import NoteIcon from '@material-ui/icons/Note';
import RestoreIcon from '@material-ui/icons/Restore';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import StrikethroughSIcon from '@material-ui/icons/StrikethroughS';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { EntryStates, EntryTypes } from '../../io/entry';
import { useStyle, useStyles } from '../useStyles';
import { useHovered } from '../../utils';
import { useColors } from '../../Colors';
import { Button } from '../Button';
import { Tooltip } from '@material-ui/core';

interface IProps {
  state: EntryStates;
  setState: (state: EntryStates) => void;
  type: EntryTypes;
  setType: (type: EntryTypes) => void;
}

const IconContainer: React.FC<{ padding?: string; tip: string }> = ({ children, padding = '0', tip }) => {
  const style = useStyle({
    lineHeight: 0,
    padding,
  });

  return (
    <Tooltip title={tip} enterNextDelay={1000} enterDelay={1000} leaveDelay={200}>
      <span className={style}>{children}</span>
    </Tooltip>
  );
};

const ICON_STYLE = {
  height: '20px',
  width: '20px',
};

const Symbols: { [K in EntryTypes | EntryStates]: ReactNode } = {
  [EntryTypes.Task]: (
    <IconContainer tip="Task">
      <FiberManualRecordIcon style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryTypes.Note]: (
    <IconContainer tip="Note">
      <NoteIcon style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryTypes.Question]: (
    <IconContainer tip="Question">
      <HelpIcon style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryTypes.Event]: (
    <IconContainer tip="Event" padding="0 0 5px 0">
      <ChangeHistory style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryStates.Pushed]: (
    <IconContainer tip="Pushed / Blocked" padding="0 0 0 10px">
      <ArrowBackIosIcon style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryStates.Migrated]: (
    <IconContainer tip="Migrated">
      <ArrowForwardIosIcon style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryStates.Dropped]: (
    <IconContainer tip="Dropped" padding="2.5px 0 0 0">
      <StrikethroughSIcon style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryStates.Completed]: (
    <IconContainer tip="Completed">
      <CheckCircleOutlineIcon style={ICON_STYLE} />
    </IconContainer>
  ),
  [EntryStates.ToDo]: (
    <IconContainer tip="Pending">
      <RestoreIcon />
    </IconContainer>
  ),
};

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
  EntryTypes.Question,
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
  return x === EntryTypes.Task || x === EntryTypes.Event || x === EntryTypes.Note || x === EntryTypes.Question;
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
          <Button
            key={op}
            hoverBackground="#333"
            hoverColor={colors.white}
            onClick={() => isType(op) ? setType(op) : setState(op)}
            style={{
              font: 'inherit',
              cursor: isSelected ? 'no-drop' : 'pointer',
              background: isSelected && hovered ? colors.orange : undefined,
              color: !hovered && isSelected && op === EntryTypes.Note ? colors.darkgreen : undefined,
            }}
          >
            {Symbols[op]}
          </Button>
        );
      })}
    </div>
  );
};

export default StateSelector;
