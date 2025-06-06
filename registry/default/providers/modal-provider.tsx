import { createContext, useState, type ComponentType, type ReactNode, useCallback } from "react";

type ModalEntry<Props = any> = {
  id: symbol;
  component: ComponentType<Props & { close: () => void }>;
  props: Props;
};

export const ModalProviderContext = createContext<{
  open: <P>(component: ComponentType<P & { close: () => void }>, props: P) => symbol;
  close: (id: symbol) => void;
  modals: ModalEntry[];
} | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalEntry[]>([]);

  const open = useCallback(<P,>(component: ComponentType<P & { close: () => void }>, props: P) => {
    const id = Symbol();
    setModals((prev) => [...prev, { id, component, props }]);
    return id;
  }, []);

  const close = useCallback((id: symbol) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <ModalProviderContext.Provider value={{ open, close, modals }}>
      {children}
      {modals.map(({ component: Component, props, id }) => (
        <Component key={id.toString()} {...props} close={() => close(id)} />
      ))}
    </ModalProviderContext.Provider>
  );
}
