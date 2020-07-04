import React from 'react';
interface IProps {
}
type svg = any;
const Handle = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg {...props} viewBox="0 0 80 120">
      <circle cx="20" cy="20" fill={props.color} r="10" />
      <circle cx="60" cy="20" fill={props.color} r="10" />
      <circle cx="20" cy="60" fill={props.color} r="10" />
      <circle cx="60" cy="60" fill={props.color} r="10" />
      <circle cx="20" cy="100" fill={props.color} r="10" />
      <circle cx="60" cy="100" fill={props.color} r="10" />
    </svg>
  );
};

export default Handle;
