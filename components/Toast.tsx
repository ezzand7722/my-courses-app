'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className={`toast ${type}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', fontSize: 16, padding: '0 4px', marginRight: 8,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return { toasts, show, dismiss };
}

import React from 'react';
