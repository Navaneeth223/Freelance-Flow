import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  activeTimerId: string | null;
  projectId: string | null;
  projectName: string | null;
  clientName: string | null;
  description: string;
  isBillable: boolean;
  startTime: string | null;
  seconds: number;
  isRunning: boolean;
  startTimer: (projectId: string, projectName: string, clientName: string, description: string, isBillable: boolean, startTime: string, timerId: string) => void;
  stopTimer: () => void;
  tick: () => void;
  setDescription: (description: string) => void;
  setBillable: (isBillable: boolean) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      activeTimerId: null,
      projectId: null,
      projectName: null,
      clientName: null,
      description: '',
      isBillable: true,
      startTime: null,
      seconds: 0,
      isRunning: false,
      startTimer: (projectId, projectName, clientName, description, isBillable, startTime, timerId) => set({
        activeTimerId: timerId,
        projectId,
        projectName,
        clientName,
        description,
        isBillable,
        startTime,
        seconds: 0,
        isRunning: true
      }),
      stopTimer: () => set({
        activeTimerId: null,
        projectId: null,
        projectName: null,
        clientName: null,
        description: '',
        isBillable: true,
        startTime: null,
        seconds: 0,
        isRunning: false
      }),
      tick: () => set((state) => ({
        seconds: state.startTime 
          ? Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000)
          : state.seconds + 1
      })),
      setDescription: (description) => set({ description }),
      setBillable: (isBillable) => set({ isBillable })
    }),
    {
      name: 'freelanceflow-timer-store',
      partialize: (state) => ({
        activeTimerId: state.activeTimerId,
        projectId: state.projectId,
        projectName: state.projectName,
        clientName: state.clientName,
        description: state.description,
        isBillable: state.isBillable,
        startTime: state.startTime,
        seconds: state.seconds,
        isRunning: state.isRunning
      })
    }
  )
);
