import { createContext, useContext } from 'react';

interface IColors {
  black: string;
  white: string;
  blue: string;
  green: string;
  orange: string;
}

const colorContext = createContext<IColors>({
  black: '#0F0A0A',
  white: '#F5EFED',
  blue: '#2292A4',
  green: '#BDBF09',
  orange: '#D96C06',
});

export const useColors = () => useContext(colorContext);
