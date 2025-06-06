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

// V 0.1

// import { useState, useEffect } from "react";

// export default function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
//   const getInitialValue = () => {
//     if (typeof window === "undefined") return initialValue;
//     try {
//       const storedValue = localStorage.getItem(key);
//       return storedValue ? JSON.parse(storedValue) : initialValue;
//     } catch (error) {
//       console.error(`Error reading persistent key "${key}":`, error);
//       return initialValue;
//     }
//   };

//   const [value, setValue] = useState<T>(getInitialValue);

//   useEffect(() => {
//     try {
//       localStorage.setItem(key, JSON.stringify(value));
//     } catch (error) {
//       console.error(`Error writing persistent key "${key}":`, error);
//     }
//   }, [key, value]);

//   return [value, setValue];
// }
