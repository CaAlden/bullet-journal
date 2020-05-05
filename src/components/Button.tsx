import React from 'react';
import { useStyle } from './useStyles';

export const ButtonBase = {
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  background: 'inherit',
  margin: '0',
  minHeight: '30px',
  minWidth: '30px',
  maxHeight: '30px',
  maxWidth: '30px',
  marginRight: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '100%',
} as const;

export const Button: React.FC<{
  hoverColor: string;
  hoverBackground: string;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>> = ({
  hoverColor,
  hoverBackground,
  disabled,
  ...props
}) => {
  const className = useStyle({
    ...ButtonBase,
    ':hover': {
      color: disabled ? 'inherit' : hoverColor,
      background: disabled ? '#ddd' : hoverBackground,
    },
  });

  return (
    <button type="button" className={className} disabled={disabled} {...props} />
  );
}
