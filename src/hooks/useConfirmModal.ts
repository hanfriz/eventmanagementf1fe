import { useState, useCallback } from "react";

interface UseConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmModalState {
  isOpen: boolean;
  onConfirm: (() => void) | null;
}

export const useConfirmModal = (options: UseConfirmModalOptions) => {
  const [modalState, setModalState] = useState<ConfirmModalState>({
    isOpen: false,
    onConfirm: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const showConfirm = useCallback((onConfirm: () => void | Promise<void>) => {
    setModalState({
      isOpen: true,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await onConfirm();
          setModalState({ isOpen: false, onConfirm: null });
        } catch (error) {
          console.error("Confirm action failed:", error);
          // Keep modal open on error
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, []);

  const hideConfirm = useCallback(() => {
    if (isLoading) return; // Prevent closing while loading
    setModalState({ isOpen: false, onConfirm: null });
  }, [isLoading]);

  const handleConfirm = useCallback(() => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
  }, [modalState]);

  const modalProps = {
    isOpen: modalState.isOpen,
    onClose: hideConfirm,
    onConfirm: handleConfirm,
    isLoading,
    ...options,
  };

  return {
    showConfirm,
    hideConfirm,
    modalProps,
    isLoading,
  };
};

export default useConfirmModal;
