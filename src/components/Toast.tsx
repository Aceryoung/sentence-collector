"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ── Types ── */
type ToastItem = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextValue = {
  toast: (message: string, type?: ToastItem["type"]) => void;
};

/* ── Context ── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ── Provider ── */
let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastItem["type"] = "success") => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {items.map((item) => (
          <ToastSlot key={item.id} item={item} onDone={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Single toast slot ── */
function ToastSlot({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // enter
    requestAnimationFrame(() => setVisible(true));
    // schedule exit
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 200); // wait for exit animation
    }, 2400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDone]);

  const colorClass =
    item.type === "error"
      ? "bg-coral text-white"
      : item.type === "info"
        ? "bg-archive text-archive-contrast"
        : "bg-cta text-cta-contrast";

  return (
    <div
      className={`pointer-events-auto rounded-[var(--radius-pill)] px-5 py-2.5 text-sm font-semibold shadow-lg transition-all duration-200 ${colorClass} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {item.message}
    </div>
  );
}
