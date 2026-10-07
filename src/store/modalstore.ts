import { create } from "zustand";

export interface ModalInstance {
  id: string;
  type: string;
  title: string;
  initialData?: unknown;
  isEdit: boolean;
  minimized: boolean;
  openedAt: number;
}

interface OpenArgs {
  type: string;
  id?: string;
  title: string;
  initialData?: unknown;
  isEdit?: boolean;
}

interface ModalState {
  modals: ModalInstance[];
  openModal: (args: OpenArgs) => string;
  closeModal: (id: string) => void;
  minimizeModal: (id: string) => void;
  restoreModal: (id: string) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  modals: [],
  openModal: ({ type, id, title, initialData, isEdit = false }) => {
    const modalId = id ?? `${type}-${Date.now()}`;
    if (get().modals.some((m) => m.id === modalId)) {
      get().restoreModal(modalId);
      return modalId;
    }
    set((s) => ({
      modals: [...s.modals, { id: modalId, type, title, initialData, isEdit, minimized: false, openedAt: Date.now() }],
    }));
    return modalId;
  },
  closeModal: (id) => set((s) => ({ modals: s.modals.filter((m) => m.id !== id) })),
  minimizeModal: (id) => set((s) => ({ modals: s.modals.map((m) => (m.id === id ? { ...m, minimized: true } : m)) })),
  restoreModal: (id) => set((s) => ({ modals: s.modals.map((m) => (m.id === id ? { ...m, minimized: false } : m)) })),
}));