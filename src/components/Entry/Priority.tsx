import React from 'react';
import { useStyles } from '../useStyles';
import { useColors } from '../../Colors';

interface IProps {
  value: boolean;
  setValue: (val: boolean) => void;
}

const Priority: React.FC<IProps> = ({
  value,
  setValue,
}) => {
  const colors = useColors();
  const classes = useStyles({
    container:{
      padding: '0 5px',
      opacity: value ? 1 : 0.2,
      color: colors.black,
      textDecoration: 'none',
      cursor: 'pointer',
      fontSize: '3rem',
      userSelect: 'none',
      ':hover': {
        opacity: value ? 1 : 0.5,
      },
      overflow: 'hidden',
      display: 'flex',
    },
    asterisk: {
      height: '47px',
    },
  });
  return (
    <div className={classes.container} onClick={() => setValue(!value)}>
      <span className={classes.asterisk}>*</span>
    </div>
  );
};

export default Priority;
