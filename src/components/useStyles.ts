import { css } from 'emotion';
import { useMemo } from 'react';

type StyleArgs = Parameters<typeof css>[0];

export const useStyle = (def: StyleArgs) => {
  const className = useMemo(() => css(def), [def]);
  return className;
};

export const useStyles = <T extends {[x: string]: StyleArgs }>(defs: T): {[K in keyof T]: string } => {
  const classNames = useMemo(() => {
    return Object.fromEntries(Object.entries(defs).map(
      ([k, v]: [string, StyleArgs]) => [k, css(v)])
    ) as unknown as {[K in keyof T]: string};
  }, [defs]);

  return classNames;
}
