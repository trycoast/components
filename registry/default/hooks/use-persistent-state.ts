import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface PersistentState {
  [key: string]: any;
  setItem: (key: string, value: any) => void;
}

const storage: PersistStorage<PersistentState> = {
  getItem: (name) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const usePersistentStore = create<PersistentState>()(
  persist(
    (set) => ({
      setItem: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: "react.store.persist",
      storage: storage,
    }
  )
);

export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const store = usePersistentStore();
  const value = store[key] ?? initialValue;
  const setValue = (newValue: T) => store.setItem(key, newValue);
  return [value, setValue];
}
