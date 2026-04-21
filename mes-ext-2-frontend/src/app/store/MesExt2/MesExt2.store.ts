import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { NotificationStore } from '../notification/notification.store';
import { MesExt2Service } from '../../services/mes-ext-2/mes-ext-2.service';

type MesExt2State = {
  isInitialized: boolean;
};

const initialState: MesExt2State = {
  isInitialized: false,
};

export const MesExt2Store = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
  })),

  withMethods(
    (
      store,
      notificationStore = inject(NotificationStore),
      service = inject(MesExt2Service),
    ) => ({
    }),
  ),
);
