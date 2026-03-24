import { create } from 'zustand';
import type { HPDCMachineState, ProcessSetpoints, Alarm } from '../types/hpdc';
import { buildInitialState, applyLiveUpdate, simulateNewShot } from '../utils/mockData';

interface HPDCStore {
  machine: HPDCMachineState;
  activePage: string;
  sidebarCollapsed: boolean;

  // Actions
  setActivePage: (page: string) => void;
  toggleSidebar: () => void;
  tickLive: () => void;
  triggerShot: () => void;
  updateSetpoints: (setpoints: Partial<ProcessSetpoints>) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  clearAlarm: (alarmId: string) => void;
  setMachineStatus: (status: HPDCMachineState['status']) => void;
}

export const useHPDCStore = create<HPDCStore>((set) => ({
  machine: buildInitialState(),
  activePage: 'dashboard',
  sidebarCollapsed: false,

  setActivePage: (page) => set({ activePage: page }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  tickLive: () =>
    set((s) => ({ machine: applyLiveUpdate(s.machine) })),

  triggerShot: () =>
    set((s) => ({ machine: simulateNewShot(s.machine) })),

  updateSetpoints: (partial) =>
    set((s) => ({
      machine: {
        ...s.machine,
        setpoints: { ...s.machine.setpoints, ...partial },
      },
    })),

  acknowledgeAlarm: (alarmId) =>
    set((s) => ({
      machine: {
        ...s.machine,
        activeAlarms: s.machine.activeAlarms.map((a) =>
          a.id === alarmId ? { ...a, state: 'ACKNOWLEDGED' as const, acknowledgedAt: new Date() } : a
        ),
        alarmHistory: s.machine.alarmHistory.map((a) =>
          a.id === alarmId ? { ...a, state: 'ACKNOWLEDGED' as const, acknowledgedAt: new Date() } : a
        ),
      },
    })),

  clearAlarm: (alarmId) =>
    set((s) => {
      const cleared = s.machine.activeAlarms.map((a) =>
        a.id === alarmId ? { ...a, state: 'CLEARED' as const, clearedAt: new Date() } : a
      );
      return {
        machine: {
          ...s.machine,
          activeAlarms: cleared.filter((a) => a.state !== 'CLEARED'),
          alarmHistory: s.machine.alarmHistory.map((a) =>
            a.id === alarmId ? { ...a, state: 'CLEARED' as const, clearedAt: new Date() } : a
          ),
        },
      };
    }),

  setMachineStatus: (status) =>
    set((s) => ({ machine: { ...s.machine, status } })),
}));
