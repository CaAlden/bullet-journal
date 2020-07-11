import React, { FC } from 'react';
import { useStyle } from '../useStyles';

interface IProps {
  open: boolean;
  width: string;
}

const Drawer: FC<IProps> = ({ open, width, children }) => {
  const className = useStyle({
    width: open ? width : '0px',
    zIndex: 1,
    background: 'white',

    transition: 'width 250ms ease-in-out',
    overflow: 'hidden',

    display: 'flex',
    flexDirection: 'column',
  });

  return (
    <nav className={className}>
      {children}
    </nav>
  );
};

export default Drawer;
