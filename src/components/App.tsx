import React, { useMemo, useEffect, useCallback } from 'react';
import { useStorage, Id, IRef } from '../io/db';
import { useTrackedValue } from '../io/useTrackedValue';
import { JSONCodec, EntryCodec, EntryType } from '../io/entry';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Option';
import { AddEntry, EditEntry } from './Entry';
import { IO, chain } from 'fp-ts/lib/IO';
import { useStyle } from './useStyles';

export const REGISTRY_KEY = '__type_registry';
export const RegistryCodec = JSONCodec.pipe(t.interface({
  id: t.string,
  types: t.record(t.string, t.array(t.union([t.string, t.undefined]))),
}));

const useRegistry = () => {
  const storage = useStorage();
  const registry = useTrackedValue({ id: REGISTRY_KEY, type: RegistryCodec });
  useEffect(() => {
    pipe(
      registry,
      fold(
        storage.serialize({
          id: REGISTRY_KEY,
          types: {},
        }, RegistryCodec),
        () => {}
      ),
    );
  }, []);

  const addEntry = useCallback(
    pipe(
      registry,
      fold(
        () => (newEntry: EntryType): IO<void> => {
          throw new Error('Attempted to add Entry when registry was not configured');
        },
        (registry) => (newEntry): IO<void> => {
          return pipe(
            storage.serialize(newEntry, EntryCodec),
            chain(() => {
              const entries = registry.types[EntryCodec.name] || [];
              const tempRegistry = registry;
              entries.push(newEntry.id);
              tempRegistry.types[EntryCodec.name] = entries;
              return storage.serialize(tempRegistry, RegistryCodec);
            }),
          );
        },
      ),
    ), [registry]);

  const removeEntry = useCallback(
    pipe(
      registry,
      fold(
        () => (id: Id): IO<void> => {
          throw new Error('Attempted to add Entry when registry was not configured');
        },
        (registry) => (id): IO<void> => {
          return pipe(
            storage.removeItem(id),
            chain(() => {
              const entries = registry.types[EntryCodec.name] || [];
              const tempRegistry = registry;
              tempRegistry.types[EntryCodec.name] = entries.filter(testId => testId !== id);
              return storage.serialize(tempRegistry, RegistryCodec);
            }),
          );
        },
      ),
    ), [registry]);

  return ({
    registry,
    addEntry,
    removeEntry,
  });
};

export default function App() {
  const { registry, addEntry, removeEntry } = useRegistry();
  const appStyles = useStyle({
    padding: '10px',
  });
  return pipe(
    registry,
    fold(
      () => null,
      (registry) => {
        const entries = registry.types[EntryCodec.name];
        return (
          <div className={appStyles}>
            <h1>Todo List Tasks</h1>
            <hr />
            {entries && entries.map((id) =>
              <EditEntry id={id} key={id} remove={removeEntry(id)}/>
            )}
            <AddEntry onNew={e => {
              const addIO = addEntry(e);
              // Immediately perform the IO.
              addIO();
            }} />
          </div>
        );
      },
    )
  );
}
