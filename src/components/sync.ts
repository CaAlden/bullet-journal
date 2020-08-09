import React, { useContext, useRef } from 'react';
import { useStorage } from '../io/db';
import { absurd } from 'fp-ts/lib/function';
import debounce from 'lodash/debounce';
/**
 * This contains a context for notifying other instances of the site that changes were made.
 * NOTE: Safari doesn't support the Broadcast channel API so this functionality isn't going to
 * work for Safari users.
 */

const TAB_CHANNEL_NAME = 'tabs'
const noopChannel: BroadcastChannel = {
  name: TAB_CHANNEL_NAME,
  onmessage: null,
  onmessageerror: null,
  dispatchEvent: () => false,
  close: () => {},
  postMessage: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

enum MessageType {
  DbUpdate = "DbUpdate",
}

type Message = {
  type: MessageType.DbUpdate,
  id: string,
};

type NotificationCallback = (val: Message) => void;

class Notifier {
  private channel: BroadcastChannel;
  private subscribers: NotificationCallback[];
  public constructor() {
    this.subscribers = [];
    try {
      this.channel = new BroadcastChannel(TAB_CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel was not supported so tabs will not be synced');
      this.channel = noopChannel;
    }
    this.channel.onmessage = (ev) => {
      this.handleNotification(ev.data);
    };
  }

  private handleNotification = (val: Message) => {
    // Just call all the subscribers with the value.
    this.subscribers.map(f => f(val));
  };

  public notify = (val: Message) => {
    this.channel.postMessage(val);
  };

  public subscribe = (cb: NotificationCallback) => {
    this.subscribers.push(cb);
  };
}

// For now the Tab channel is going to be a singleton object local to this module.
const TabChannel = new Notifier();
export const useSyncDBBetweenTabs = () => {
  const storage = useStorage();
  const updating = useRef(false);
  storage.subscribeToSerialize(
    debounce((id => {
      TabChannel.notify({ type: MessageType.DbUpdate, id })
    }),
    250 // ms
  ));

  TabChannel.subscribe((msg) => {
    switch(msg.type) {
      case MessageType.DbUpdate: {
        storage.notify(msg.id);
        return;
      }
      default: {
        absurd(msg.type);
      }
    }
  });
};
