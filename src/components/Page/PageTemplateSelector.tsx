import React, { ReactElement, FC } from 'react';
import ListIcon from '@material-ui/icons/List';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import CalendarViewDayIcon from '@material-ui/icons/CalendarViewDay';
import { PageType } from '../../io/page';
import { Button } from '../Button';
import { useColors } from '../../Colors';
import { useStyle } from '../useStyles';

interface IProps {
  type?: PageType;
  setType: (newType: PageType) => void;
}

const ICON_STYLE = { width: '20px', height: '20px' };

const PageTypeIcons: {[Type in PageType]: ReactElement } = {
  [PageType.Default]: <ListIcon style={ICON_STYLE} />,
  [PageType.Notes]: <DynamicFeedIcon style={ICON_STYLE} />,
  [PageType.Calendar]: <CalendarViewDayIcon style={ICON_STYLE} />,
};

const TemplateOption: FC<{ onClick: () => void, type: PageType, active: boolean }> = ({
  onClick,
  type,
  active,
}) => {
  const colors = useColors();
  return (
    <Button
      hoverColor={colors.white}
      hoverBackground={colors.black}
      onClick={onClick}
      style={{ opacity: active ? 1 : 0.4 }}
    >
      {PageTypeIcons[type]}
    </Button>
  )
};

const PageTemplateSelector: FC<IProps> = ({ type = PageType.Default, setType }) => {
  const className = useStyle({
    display: 'grid',
    gap: '10px',
    gridTemplateColumns: 'repeat(3, 20px)',
  });
  return (
    <div className={className}>
      <TemplateOption type={PageType.Default} active={type === PageType.Default} onClick={() => setType(PageType.Default)} />
      <TemplateOption type={PageType.Notes} active={type === PageType.Notes} onClick={() => setType(PageType.Notes)} />
      <TemplateOption type={PageType.Calendar} active={type === PageType.Calendar} onClick={() => setType(PageType.Calendar)} />
    </div>
  );
};

export default PageTemplateSelector;
