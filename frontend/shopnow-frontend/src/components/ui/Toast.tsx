'use client';

import { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastHandlers: ((toast: Omit<ToastItem, 'id'>) => void)[] = [];

export const toast = {
  success: (message: string, duration = 3000) =>
    toastHandlers.forEach((h) => h({ type: 'success', message, duration })),
  error: (message: string, duration = 4000) =>
    toastHandlers.forEach((h) => h({ type: 'error', message, duration })),
  warning: (message: string, duration = 3500) =>
    toastHandlers.forEach((h) => h({ type: 'warning', message, duration })),
  info: (message: string, duration = 3000) =>
    toastHandlers.forEach((h) => h({ type: 'info', message, duration })),
};

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'border-green-200 bg-white',
  error: 'border-red-200 bg-white',
  warning: 'border-amber-200 bg-white',
  info: 'border-blue-200 bg-white',
};

const SingleToast = ({
  toast: t,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(t.id), 300);
    }, t.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onRemove]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(2rem)',
        transition: 'all 0.3s',
      }}
      className={`flex items-start gap-3 w-80 p-4 rounded-xl border shadow-lg ${bgMap[t.type]}`}
    >
      {iconMap[t.type]}
      <p className="flex-1 text-sm leading-snug">{t.message}</p>
      <button onClick={() => { setVisible(false); setTimeout(() => onRemove(t.id), 300); }}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    setMounted(true);
    toastHandlers.push(addToast);
    return () => {
      toastHandlers = toastHandlers.filter((h) => h !== addToast);
    };
  }, [addToast]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <SingleToast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;