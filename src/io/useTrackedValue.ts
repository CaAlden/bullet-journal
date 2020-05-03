import { useContext, useEffect, useState } from 'react';
import { useStorage, Id, IRef, IPersistable } from './db';
import { Option, none } from 'fp-ts/lib/Option';

export const useTrackedValue = <T extends IPersistable>(ref: IRef<T>) => {
  const db = useStorage();
  const [value, setValue] = useState<Option<T>>(db.deserialize(ref)());

  useEffect(() => {
    return db.subscribe(ref.id, () => {
      const deserializeIO = db.deserialize(ref);
      // Perform the deserialization immediately
      setValue(deserializeIO());
    });
  }, []);

  return value;
};
