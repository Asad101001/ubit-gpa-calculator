import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentView: 'calculator' | 'results';
  setCurrentView: (view: 'calculator' | 'results') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      currentView: 'calculator',
      setCurrentView: (currentView) => set({ currentView }),
    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => (state) => {
        document.documentElement.setAttribute('data-theme', 'light');
      },
    }
  )
);
