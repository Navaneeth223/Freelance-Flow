import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeOnboardingStep: number;
  setActiveOnboardingStep: (step: number) => void;
  onboardingDismissed: boolean;
  setOnboardingDismissed: (dismissed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  activeOnboardingStep: 1,
  setActiveOnboardingStep: (activeOnboardingStep) => set({ activeOnboardingStep }),
  onboardingDismissed: false,
  setOnboardingDismissed: (onboardingDismissed) => set({ onboardingDismissed })
}));
