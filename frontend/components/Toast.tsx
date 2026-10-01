'use client';
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | null;
  message: string;
  onClose: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    if (!type) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [type, onClose]);

  if (!type) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-slide-up transition-all bg-white"
         style={{ borderColor: isSuccess ? '#86efac' : '#fca5a5' }}>
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600" />
      )}
      <span className={isSuccess ? 'text-emerald-900' : 'text-rose-900'}>{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}