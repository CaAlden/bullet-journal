import React, { FC, SVGProps } from 'react';

const Bookmark: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg {...props} viewBox="0 0 10 10" style={{ cursor: 'pointer'}}>
      <polygon points="10,0 5,5 10,10 0,10 0,0" fill={props.color ?? '#800020'} />
    </svg>
  );
};

export default Bookmark;
