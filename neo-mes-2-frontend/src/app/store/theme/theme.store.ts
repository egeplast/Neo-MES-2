import { computed, effect } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  mode: ThemeMode;
  systemPrefersDark: boolean;
};

const STORAGE_KEY = 'theme-mode';

function readInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.sessionStorage?.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function readSystemPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const initialState: ThemeState = {
  mode: readInitialMode(),
  systemPrefersDark: readSystemPreference(),
};

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store) => {
    const resolvedIsDark = computed(() => {
      const mode = store.mode();
      if (mode === 'dark') return true;
      if (mode === 'light') return false;
      return store.systemPrefersDark();
    });

    return {
      resolvedIsDark,

      setMode(mode: ThemeMode): void {
        patchState(store, { mode });
        if (typeof window !== 'undefined') {
          window.sessionStorage?.setItem(STORAGE_KEY, mode);
        }
      },

      cycleMode(): void {
        const next: ThemeMode =
          store.mode() === 'light' ? 'dark' : store.mode() === 'dark' ? 'system' : 'light';
        this.setMode(next);
      },

      updateSystemPreference(prefersDark: boolean): void {
        patchState(store, { systemPrefersDark: prefersDark });
      },
    };
  }),

  withHooks({
    onInit(store) {
      if (typeof document !== 'undefined') {
        effect(() => {
          const mode = store.mode();
          const systemDark = store.systemPrefersDark();
          const isDark = mode === 'dark' || (mode === 'system' && systemDark);
          document.documentElement.classList.toggle('dark', isDark);
        });
      }

      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', (e) => store.updateSystemPreference(e.matches));
      }
    },
  }),
);
