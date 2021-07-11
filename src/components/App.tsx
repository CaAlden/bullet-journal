import React, { useMemo, useEffect, useCallback, useState, Fragment } from 'react';
import { ap } from 'fp-ts/lib/Array';
import { useStorage, Id, IRef } from '../io/db';
import { useTrackedValue, useExistentTrackedValue } from '../io/useTrackedValue';
import { EntryCodec, EntryType } from '../io/entry';
import { JSONCodec } from '../io/json';
import ClearIcon from '@material-ui/icons/Clear';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Option';
import { AddEntry, EditEntry } from './Entry';
import { IO, chain, map } from 'fp-ts/lib/IO';
import { useStyle, useStyles } from './useStyles';
import { IPage, PageCodec } from '../io/page';
import Page from './Page';
import NewPageInput from './NewPageInput';
import { useColors } from '../Colors';
import { useLastVisited } from '../session';
import { identity } from 'fp-ts/lib/function';
import { Button } from './Button';
import { useDefaultPages } from './useDefaultPages';
import { Divider } from '@material-ui/core';
import { useMigrations } from '../Migration';

export const REGISTRY_KEY = '__type_registry';
export const RegistryCodec = JSONCodec.pipe(t.type({
  id: t.string,
  types: t.record(t.string, t.array(t.union([t.string, t.undefined]))),
}));

export const useRegistry = () => {
  const storage = useStorage();
  const registry = useTrackedValue({ id: REGISTRY_KEY, type: RegistryCodec });
  useEffect(() => {
    pipe(
      registry,
      fold(
        storage.serialize({
          id: REGISTRY_KEY,
          types: {
            [PageCodec.name]: [],
          },
        }, RegistryCodec),
        () => {}
      ),
    );
  }, []);

  const addPage = useCallback(
    pipe(
      registry,
      fold(
        () => (newPage: IPage): IO<void> => {
          throw new Error('Attempted to add Entry when registry was not configured');
        },
        (registry) => (newPage): IO<void> => {
          return pipe(
            storage.serialize(newPage, PageCodec),
            chain(() => {
              const entries = registry.types[PageCodec.name] || [];
              const tempRegistry = registry;
              entries.push(newPage.id);
              tempRegistry.types[PageCodec.name] = entries;
              return storage.serialize(tempRegistry, RegistryCodec);
            }),
          );
        },
      ),
    ), [registry]);

  const removePage = useCallback(
    pipe(
      registry,
      fold(
        () => (id: Id): IO<void> => {
          throw new Error('Attempted to add Entry when registry was not configured');
        },
        (registry) => (id): IO<void> => {
          const removeIds: IO<void> = pipe(
            storage.deserialize({ id, type: PageCodec }),
            map(
              fold(
                (): IO<void>[] => [],
                (p) => p.tasks.map(id => storage.removeItem(id)),
              ),
            ),
            chain(a => () => a.forEach(action => action())),
          );

          return pipe(
            removeIds,
            chain(() => storage.removeItem(id)),
            chain(() => {
              const entries = registry.types[PageCodec.name] || [];
              const tempRegistry = registry;
              tempRegistry.types[PageCodec.name] = entries.filter(testId => testId !== id);
              console.log(tempRegistry);
              return storage.serialize(tempRegistry, RegistryCodec);
            }),
          );
        },
      ),
    ), [registry]);

  return ({
    registry,
    addPage,
    removePage,
  });
};

const PageLink: React.FC<{
  id: Id,
  selected: boolean;
  onClick: () => void;
}> = ({
  id,
  selected,
  onClick,
}) => {
  const page = useExistentTrackedValue({ id, type: PageCodec });
  const colors = useColors();
  const className = useStyle({
    color: selected ? colors.orange : colors.blue,
    cursor: 'pointer',
    fontWeight: selected ? 'bold' : 'normal',
    fontFamily: 'Permanent Marker',
    ':hover': {
      color: colors.orange,
      textDecoration: 'underline',
    },
  });
  return (
    <div className={className} onClick={onClick}>{page.name}</div>
  );
};

export default function App() {
  const { registry, addPage, removePage } = useRegistry();

  useMigrations();
  const colors = useColors();
  const appStyles = useStyles({
    page: {
      flexGrow: 1,
      color: colors.black,
      background: colors.white,
      padding: '1em',
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gridAutoColumns: '1fr',
      gap: '20px',
    },
    side: {
      padding: '5px',
      display: 'grid',
      gridTemplateColumns: '1fr 30px',
      gridAutoRows: 'min-content',
      gap: '10px',
      borderRight: `1px solid ${colors.black}`,
    },
    main: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
  });

  const pages = pipe(
    registry,
    fold(
      (): string[] => [],
      (registry) => registry.types[PageCodec.name],
    ),
  );

  const defaultPages = useDefaultPages();

  const { lastVisited, setLastVisited } = useLastVisited();
  const initial = !pages || pages.length === 0 ? null :
    fold<string, string>(
      (): string => {
        const first = pages[0];
        setLastVisited(first)();
        return first;
      },
      identity,
    )(lastVisited);

  const [selected, setSelected] = useState<null | Id>(initial);

  const doPageCreation = (page: IPage): IO<void> => {
    return pipe(
      addPage(page),
      map(() => {
        setSelected(page.id);
      }),
    );
  }

  return (
    <div className={appStyles.page}>
      <div className={appStyles.side}>
        {defaultPages.map(({ id }) =>
          <Fragment key={id}>
            <PageLink
              onClick={() => {
                setSelected(id);
                setLastVisited(id)();
              }}
              selected={selected === id}
              id={id}
            />
            <div />
          </Fragment>
        )}
        <Divider /><div />
        {!pages ? null : pages.map((id) => (
          <Fragment key={id}>
            <PageLink
              onClick={() => {
                setSelected(id);
                setLastVisited(id)();
              }}
              selected={selected === id}
              id={id}
            />
            <Button
              hoverColor={colors.white}
              hoverBackground={colors.orange}
              onClick={() => {
                removePage(id)();
                if (selected === id) {
                  setSelected(null);
                  pipe(
                    lastVisited,
                    fold(() => {}, (last) => {
                      if (last === id) {
                        setLastVisited(null)();
                      }
                    }),
                  );
                }
              }}
            ><ClearIcon /></Button>
          </Fragment>
        ))}
        <NewPageInput onNew={doPageCreation} />
      </div>
      <main className={appStyles.main}>
        {selected !== null &&
          <Page id={selected} />
        }
      </main>
    </div>
  );
}
