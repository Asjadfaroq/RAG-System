"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto flex max-w-sm items-center gap-3 rounded-md border px-4 py-2 text-sm shadow-lg backdrop-blur",
              toast.variant === "success"
                ? "border-emerald-500/60 bg-gradient-to-r from-emerald-500/90 to-teal-400/90 text-white"
                : "",
              toast.variant === "error"
                ? "border-rose-500/60 bg-gradient-to-r from-rose-500/95 to-orange-500/90 text-white"
                : "",
              toast.variant === "info"
                ? "border-sky-500/60 bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-sky-900/90 text-slate-50"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

