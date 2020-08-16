import React from 'react';
import { useStorage, DBObserver } from './io/db';
import { useRegistry } from './components/App';
import * as iots from 'io-ts';
import { useTrackedValue } from './io/useTrackedValue';
import { fold } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { JSONCodec } from './io/json';
import { PageCodec } from './io/page';
import { map } from 'fp-ts/lib/Array';

const MIGRATION_FLAGS = '__migration_flags';

const MigrationCodec = JSONCodec.pipe(iots.type({
  id: iots.string,
  jsonPiped: iots.boolean,
}));

const handleMigrations = (
  config: iots.TypeOf<typeof MigrationCodec>,
  storage: DBObserver,
  registry: ReturnType<typeof useRegistry>
) => {
  if (!config.jsonPiped) {
    const oldString = 'pipe(JSONCodec, { id: string, name: string, start: pipe(string, DateCodec), end: pipe(string, DateCodec), tasks: Array<string> })';
    pipe(
      registry.registry,
      fold(
        () => {
          storage.serialize({ ...config, jsonPiped: false }, MigrationCodec)();
        },
        (r) => {
          if (r.types[oldString] !== undefined) {
            // Move all old pages over
            pipe(
              r.types[oldString],
              map(pageId => {
                pipe(
                  storage.deserialize({ id: pageId, type: PageCodec })(),
                  fold(() => {}, (page) => registry.addPage(page)())
                );
              })
            );
            storage.serialize({ ...config, jsonPiped: true }, MigrationCodec)();
          }
        }
      ),
    );
  }
};

export const useMigrations = () => {
  const storage = useStorage();
  const registry = useRegistry();

  const migrations = useTrackedValue({ id: MIGRATION_FLAGS, type: MigrationCodec });
  pipe(
    migrations,
    fold(
     () => {
       handleMigrations({ id: MIGRATION_FLAGS, jsonPiped: false }, storage, registry);
     },
     (configs) => {
       handleMigrations(configs, storage, registry);
     }),
  );
};
