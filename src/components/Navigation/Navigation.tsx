import React, { FC, useState } from 'react';
import { useStyle } from '../useStyles';
import Drawer from './Drawer';
import Bookmark from './Bookmark';

const BOOKMARK_COLOR = '#800020';

const DrawerItem: FC = ({ children }) => {
  const className = useStyle({
    flexGrow: 1,
    borderBottom: '1px solid black',
    display: 'flex',
    justifyItems: 'center',
    alignItems: 'center',
  });
  return (
    <div className={className}>
      {children}
    </div>
  );
};

const Navigation: FC = () => {
  const [open, setOpen] = useState(false);
  const className = useStyle({
    display: 'flex',
  });

  const bookmarkBar = useStyle({
    flexGrow: 1,
    height: '25px',
    background: BOOKMARK_COLOR,
  });

  return (
    <div className={className}>
      <Drawer open={open} width="200px">
        <div className={bookmarkBar} />
        <DrawerItem>
          <span>Example</span>
        </DrawerItem>
      </Drawer>
      <Bookmark color={BOOKMARK_COLOR} onClick={() => setOpen(o => !o)} width="25px" height="25px" />
    </div>
  );
};

export default Navigation;
