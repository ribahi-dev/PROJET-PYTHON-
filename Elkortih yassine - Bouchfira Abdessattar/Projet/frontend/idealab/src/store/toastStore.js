import { create } from 'zustand'

const useToastStore = create((set) => ({
  toasts: [],
  pushToast: (toast) => set((s) => ({ toasts: [...s.toasts, { id: Date.now() + Math.random(), type: 'info', ...toast }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id != id) })),
}))

export default useToastStore
