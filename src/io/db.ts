import { createContext, useContext } from 'react';
import { Option, fromEither, fromNullable, fold, some } from 'fp-ts/lib/Option';
import { io, IO, chain } from 'fp-ts/lib/IO';
import { map } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';
import { v4 } from 'uuid';
/**
 * Utilities for interacting with the Local Storage as a DB.
 */

export type Id = string;
export interface IRef<T> {
  id: Id;
  type: t.Type<T, string, string>;
}

interface IStorageInterface {
  getItem: (key: Id) => string | null;
  setItem: (key: Id, item: string) => void;
  removeItem: (key: Id) => void;
}

interface IEventInterface {
  addEventListener: (type: string, l: (e: StorageEvent) => void) => void;
}

export interface IPersistable {
  id: Id;
}

interface IDbInteractor {
  serialize: <T extends IPersistable>(t: T, type: t.Type<T, string, string>) => IO<void>;
  deserialize: <T extends IPersistable>(ref: IRef<T>) => IO<Option<T>>;
  removeItem: (id: Id) => IO<void>;
}


export class DB implements IDbInteractor {
  public constructor(
    private storage: IStorageInterface,
  ) {}

  public serialize = <T extends IPersistable>(t: T, type: t.Type<T, string, string>): IO<void> => {
    return () => this.storage.setItem(t.id, type.encode(t));
  };

  public deserialize = <T extends IPersistable>(ref: IRef<T>): IO<Option<T>> => {
    return () => pipe(
      ref.type.decode(this.storage.getItem(ref.id)),
      fromEither,
    );
  };

  public removeItem = (id: Id): IO<void> => {
    return () => {
      console.log(`removing ${id}`);
      this.storage.removeItem(id);
    }
  };
}

type SubscriptionCallback = () => void;
export class DBObserver implements IDbInteractor {
  public static createObservableDb = (storage: IStorageInterface, eventApi: IEventInterface) => {
    const db = new DB(storage);
    return new DBObserver(db, eventApi);
  };

  private subscriptions: Map<string, SubscriptionCallback[]>;
  private ignoreUpdates: boolean;
  public constructor(private readonly db: DB, eventApi: IEventInterface) {
    this.subscriptions = new Map();
    this.ignoreUpdates = false;
    eventApi.addEventListener('storage', this.onEvent);
  }

  public setIgnore = (ignore: boolean) => {
    this.ignoreUpdates = ignore;
  };

  private onEvent = (e: StorageEvent) => {
    if (!this.ignoreUpdates) {
      this.notify(e.key);
    }
  };

  public subscribe = (id: Id, callback: SubscriptionCallback): () => void => {
    this.subscriptions.set(id, pipe(
      this.subscriptions.get(id),
      fromNullable,
      fold(
        () => [callback],
        (arr) => [...arr, callback],
      ),
    ));

    // Returns an unsubscribe function.
    return () => {
      this.subscriptions.set(
        id,
        pipe(
          this.subscriptions.get(id),
          fromNullable,
          fold(
            () => [],
            (a) => {
              return a.filter(test => test !== callback);
            }
          ),
        ),
      );
    };
  };

  public notify = (id: string) => {
    pipe(
      this.subscriptions.get(id),
      fromNullable,
      fold(
        () => {},
        map((cbk) => cbk()),
      )
    );
  };

  public notifyAll = () => {
    this.subscriptions.forEach(cbks => cbks.forEach(cbk => cbk()));
  };

  public serialize = <T extends IPersistable>(t: T, type: t.Type<T, string, string>): IO<void> => {
    return pipe(
      this.db.serialize(t, type),
      chain(() => () => {
        this.notify(t.id);
      }),
    );
  };

  public deserialize = <T extends IPersistable>(ref: IRef<T>): IO<Option<T>> => {
    return this.db.deserialize(ref);
  };

  public removeItem = (id: Id): IO<void> => {
    return this.db.removeItem(id);
  };
}

const StorageDBContext = createContext(DBObserver.createObservableDb(window.localStorage, window));
export const useStorage = () => useContext(StorageDBContext);
export const ProvideLocalStorageDB = StorageDBContext.Provider;
