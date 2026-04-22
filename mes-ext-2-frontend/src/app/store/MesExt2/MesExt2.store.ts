import { inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { MesExt2Service } from '../../services/Neo-MES-2/Neo-MES-2.service';
import { NotificationStore } from '../notification/notification.store';

type MesExt2State = {
  isInitialized: boolean;
};

const initialState: MesExt2State = {
  isInitialized: false,
};

export const MesExt2Store = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({})),

  withMethods(
    (
      store,
      notificationStore = inject(NotificationStore),
      service = inject(MesExt2Service),
    ) => ({}),
  ),
);
