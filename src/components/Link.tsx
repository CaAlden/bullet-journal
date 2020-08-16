import React, { FC, useEffect, useState } from 'react';
import LinkIcon from '@material-ui/icons/Link';
import { useStyle } from './useStyles';
import { CardContent } from '@material-ui/core';

interface IProps {
  link: string;
}

const Link: FC<IProps> = ({ link }) => {
  const className = useStyle({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  });
  return (
    <a href={link} target="_blank">
      <div className={className}>
        <LinkIcon />
        {link}
      </div>
    </a>
  );
};

export default Link;
