"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import AppConfirmModal from "@/components/ui/AppConfirmModal";
import AppAlertModal from "@/components/ui/AppAlertModal";

type ConfirmVariant = "primary" | "danger";
type AlertVariant = "info" | "warning" | "danger" | "success";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface AlertOptions {
  title: string;
  message?: string;
  variant?: AlertVariant;
  buttonText?: string;
}

type AlertInput = string | AlertOptions;

interface AppModalContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  alert: (opts: AlertInput) => Promise<void>;
}

const AppModalContext = createContext<AppModalContextValue | null>(null);

export function useAppModal(): AppModalContextValue {
  const ctx = useContext(AppModalContext);
  if (!ctx) throw new Error("useAppModal must be used within AppModalProvider");
  return ctx;
}

export function AppModalProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmOptions & { open: boolean }>({
    open: false,
    title: "",
  });
  const [alertState, setAlertState] = useState<AlertOptions & { open: boolean }>({
    open: false,
    title: "",
  });

  const confirmResolver = useRef<((v: boolean) => void) | null>(null);
  const alertResolver = useRef<(() => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
      setConfirmState({ ...opts, open: true });
    });
  }, []);

  const alert = useCallback((opts: AlertInput): Promise<void> => {
    const normalized: AlertOptions =
      typeof opts === "string" ? { title: opts } : opts;
    return new Promise<void>((resolve) => {
      alertResolver.current = resolve;
      setAlertState({ ...normalized, open: true });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
    confirmResolver.current?.(true);
    confirmResolver.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
    confirmResolver.current?.(false);
    confirmResolver.current = null;
  }, []);

  const handleAlertClose = useCallback(() => {
    setAlertState((s) => ({ ...s, open: false }));
    alertResolver.current?.();
    alertResolver.current = null;
  }, []);

  return (
    <AppModalContext.Provider value={{ confirm, alert }}>
      {children}
      <AppConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <AppAlertModal
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttonText={alertState.buttonText}
        onClose={handleAlertClose}
      />
    </AppModalContext.Provider>
  );
}
