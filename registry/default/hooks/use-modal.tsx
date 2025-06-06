import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useState } from "react";

export default function useModal<TProps>(render: (props: TProps) => React.ReactNode) {
  const [open, setOpen] = useState(false);
  const [props, setProps] = useState<TProps | null>(null);

  const openModal = useCallback((newProps: TProps) => {
    setProps(newProps);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setProps(null);
  }, []);

  const Modal = useCallback(() => {
    if (!open || !props) return null;

    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
          />
          <Dialog.Title className="hidden" />
          <Dialog.Content
            aria-labelledby={undefined}
            aria-describedby={undefined}
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            )}
          >
            {render(props)}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }, [open, props, render]);

  return { open: openModal, close: closeModal, Modal };
}
