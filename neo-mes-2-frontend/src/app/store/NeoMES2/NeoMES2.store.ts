import { inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { NeoMES2Service } from '../../services/Neo-MES-2/Neo-MES-2.service';
import { NotificationStore } from '../notification/notification.store';

type NeoMES2State = {
  isInitialized: boolean;
};

const initialState: NeoMES2State = {
  isInitialized: false,
};

export const NeoMES2Store = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({})),

  withMethods(
    (
      store,
      notificationStore = inject(NotificationStore),
      service = inject(NeoMES2Service),
    ) => ({}),
  ),
);
