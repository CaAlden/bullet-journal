import * as t from 'io-ts';
import { useStorage, Id } from './io/db';
import { useTrackedValue } from './io/useTrackedValue';
import { JSONCodec } from './io/json';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold, none, fromNullable } from 'fp-ts/lib/Option';
import { useEffect } from 'react';
import { IO } from 'fp-ts/lib/IO';

export const LAST_PAGE_KEY = '__last_visited';
const RefCodec = JSONCodec.pipe(
  t.type({
    id: t.string,
    ref: t.union([t.string, t.null]),
  }),
);

export const useLastVisited = () => {
  const storage = useStorage();
  const lastVisited = useTrackedValue({ id: LAST_PAGE_KEY, type: RefCodec });
  // On mount, create a null value if none is set.
  useEffect(() => {
    pipe(
      fold(
        () => {
          // Immediately invoke the IO.
          storage.serialize({ id: LAST_PAGE_KEY, ref: null }, RefCodec)();
        },
        () => {},
      ),
    );
  }, []);

  const setLastVisited = (id: Id | null): IO<void> => {
    return storage.serialize({ id: LAST_PAGE_KEY, ref: id }, RefCodec);
  };

  const dereferencedLast = pipe(
    lastVisited,
    fold(
      () => none,
      (reference) => fromNullable(reference.ref)
    ),
  );

  return ({
    lastVisited: dereferencedLast,
    setLastVisited,
  });
};
