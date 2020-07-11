import { useContext, useEffect, useState } from 'react';
import { useStorage, Id, IRef, IPersistable, DBObserver } from './db';
import { Option, none, fold } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { identity } from 'fp-ts/lib/function';
import * as iots from 'io-ts';

export const makeFieldSetter = <T extends IPersistable, K extends keyof T>(
  db: DBObserver,
  field: K,
  entry: T,
  codec: iots.Type<T, string, string>,
) => {
  return (val: T[K]) => {
    const newE = {
      ...entry,
      [field]: val,
    }
    db.serialize(newE, codec)();
  };
};

export const useTrackedValue = <T extends IPersistable>({ id, type }: IRef<T>) => {
  const db = useStorage();
  const refresh = db.deserialize({ id, type });
  const [value, setValue] = useState<Option<T>>(refresh());

  useEffect(() => {
    // Whenever this runs refresh the value.
    setValue(refresh());
    return db.subscribe(id, () => {
      setValue(refresh);
    });
  }, [id, type]);

  return value;
};

export const useExistentTrackedValue = <T extends IPersistable>(ref: IRef<T>) => {
  const value = useTrackedValue(ref);
  return pipe(
    value,
    fold(
    () => {
      throw new Error(`Attempted to use ${ref.type.name}:${ref.id}, but no value was found`);
    },
    identity,
    )
  );
};
