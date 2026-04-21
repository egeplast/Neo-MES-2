import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { v4 } from "uuid";

export type NotificationType = "Loading" | "Info" | "Error";

type Notification = {
  message: string;
  type: NotificationType;
  id: string;
};

type NotificationState = {
  Notifications: Notification[];
};

const initialstate: NotificationState = {
  Notifications: [],
};

export const NotificationStore = signalStore(
  { providedIn: "root" },
  withState(initialstate),
  withMethods((store) => ({
    addLoading(id: string, message: string) {
      patchState(store, (state) => ({
        Notifications: [
          ...state.Notifications,
          { message, type: "Loading" as const, id },
        ],
      }));
    },
    addSuccess(id: string, message: string) {
      const newId = v4();

      patchState(store, (state) => ({
        Notifications: message
          ? [
              ...state.Notifications.filter((n) => n.id !== id),
              { id: newId, type: "Info" as const, message },
            ]
          : state.Notifications.filter((n) => n.id !== id),
      }));

      setTimeout(() => {
        this.removeNotification(newId);
      }, 5000);
    },
    addError(id: string, message: string) {
      const newId = v4();
      patchState(store, (state) => ({
        Notifications: [
          ...state.Notifications.filter((n) => n.id !== id),
          { id: newId, type: "Error" as const, message },
        ],
      }));

      setTimeout(() => {
        this.removeNotification(newId);
      }, 5000);
    },

    removeNotification(id: string) {
      patchState(store, (state) => ({
        Notifications: [...state.Notifications.filter((n) => n.id !== id)],
      }));
    },
  })),
);
