import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { LinieAnschluss, Silodaten } from '@shared/interfaces/Silodaten.interface';
import { forkJoin } from 'rxjs';
import { v4 } from 'uuid';
import { environment } from '../../../environments/environment';
import { NotificationStore } from '../notification/notification.store';

type SiloState = {
  Silodaten: Silodaten[];
  isLoading: boolean;
  Windgeschwindigkeit: number | null;
};

const initialState: SiloState = {
  Silodaten: [],
  isLoading: false,
  Windgeschwindigkeit: null,
};

const MAX_GEWICHT = 25000;
const SILO_COUNT = 24;
const POLL_INTERVAL = 60000;

export const SiloStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    silosWithMeta: computed(() =>
      store.Silodaten().map((silo) => {
        const pct = Math.min((silo.Gewicht || 0) / MAX_GEWICHT, 1);
        const fillColor = pct > 0.7 ? '#22c55e' : pct > 0.3 ? '#f97316' : '#ef4444';
        const isEmpty = silo.Gewicht === 0;
        return { ...silo, pct, fillColor, isEmpty };
      }),
    ),
  })),

  withMethods((store, http = inject(HttpClient), notificationStore = inject(NotificationStore)) => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    function fetchSilos(showLoading: boolean): void {
      if (showLoading) {
        patchState(store, { isLoading: true });
      }

      const baseUrl = `${environment.apiBaseUrl}/opcua/live`;

      const siloRequests = Array.from({ length: SILO_COUNT }, (_, i) =>
        http.get<Record<string, { value: any; updatedAt: string }>>(
          `${baseUrl}?connection=Motan_Convey&group=Silo&index=${i + 1}`,
        ),
      );

      forkJoin(siloRequests).subscribe({
        next: (responses) => {
          const silodaten: Silodaten[] = responses.map((res, i) => ({
            SiloNr: i + 1,
            Gewicht: res['Vorrat']?.value ?? 0,
            Artikelnummer: res['Artikelnummer']?.value ?? null,
            Charge: res['Charge']?.value?.trim() ?? null,
            MFR: res['MFR']?.value ?? null,
            Priority: res['Priority']?.value ?? null,
            Abgaenge: mapAbgaenge(res),
          }));

          // Windgeschwindigkeit kommt ggf. aus einem separaten Node
          const wind = responses[0]?.['Windgeschwindigkeit']?.value ?? null;

          patchState(store, {
            Silodaten: silodaten,
            isLoading: false,
            Windgeschwindigkeit: wind,
          });
        },
        error: () => {
          notificationStore.addError(v4(), 'Silodaten konnten nicht geladen werden.');
          patchState(store, { isLoading: false });
        },
      });
    }

    function mapAbgaenge(res: Record<string, { value: any }>): Silodaten['Abgaenge'] {
      // Abgänge aus den OPC-UA-Daten extrahieren
      // Struktur an eure tatsächlichen OPC-UA-Nodes anpassen
      const abgaenge: Silodaten['Abgaenge'] = [];

      for (let a = 1; a <= 2; a++) {
        const linien: LinieAnschluss[] = [];
        const linieKey = `Abgang${a}_Linie`;
        const extruderKey = `Abgang${a}_Extruder`;

        if (res[linieKey]?.value) {
          linien.push({
            Linie: res[linieKey].value,
            Extruder: (res[extruderKey]?.value ?? 1) as 1 | 2,
          });
        }

        abgaenge.push({ Linien: linien });
      }

      return abgaenge;
    }

    return {
      loadSilodaten(): void {
        fetchSilos(true);
      },

      startPolling(): void {
        if (pollTimer) return;
        fetchSilos(true);
        pollTimer = setInterval(() => fetchSilos(false), POLL_INTERVAL);
      },

      stopPolling(): void {
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
      },
    };
  }),
);
