import { useContext } from "react";
import { ModalProviderContext } from "@/registry/default/providers/modal-provider";

export default function useModalManager() {
  const context = useContext(ModalProviderContext);

  if (!context) {
    throw new Error("useModalManager must be used within a ModalProvider");
  }

  const { open, close } = context;

  function register<Props>(Component: React.ComponentType<Props & { close: () => void }>) {
    let currentId: symbol | null = null;

    return {
      open: (props: Props) => {
        currentId = open(Component, props);
      },
      close: () => {
        if (currentId) close(currentId);
      },
    };
  }

  return { register };
}
