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
  visitble?: boolean,
} & React.HTMLAttributes<HTMLButtonElement>> = ({
  hoverColor,
  hoverBackground,
  disabled,
  visitble = true,
  ...props
}) => {
  const className = useStyle({
    ...ButtonBase,

    opacity: visitble ? 1 : 0,
    transition: 'opacity 250ms ease-in-out, border 250ms linear',
    ':hover': {
      color: disabled ? 'inherit' : hoverColor,
      background: disabled ? '#ddd' : hoverBackground,
      border: 0,
    },
    ':active': {
      border: `10px solid ${hoverBackground}`,
    },
  });

  return (
    <button type="button" className={className} disabled={disabled} {...props} />
  );
}
