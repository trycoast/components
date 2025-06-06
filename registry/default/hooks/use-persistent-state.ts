import { useState, useEffect } from "react";

export default function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const getInitialValue = () => {
    if (typeof window === "undefined") return initialValue;
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error(`Error reading persistent key "${key}":`, error);
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(getInitialValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing persistent key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
