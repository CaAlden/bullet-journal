import React from 'react';
import { useStyles } from '../useStyles';

interface IProps {
  value: boolean;
  setValue: (val: boolean) => void;
}

const Priority: React.FC<IProps> = ({
  value,
  setValue,
}) => {
  const classes = useStyles({
    container:{
      opacity: value ? 1 : 0.2,
      color: '#404040',
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
      marginTop: '20px',
    },
  });
  return (
    <div className={classes.container} onClick={() => setValue(!value)}>
      <span className={classes.asterisk}>*</span>
    </div>
  );
};

export default Priority;
