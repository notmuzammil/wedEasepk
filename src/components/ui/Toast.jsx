import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const TOAST_DURATION_MS = 4000;

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 border-emerald-200',
    icon_color: 'text-emerald-600',
    title_color: 'text-emerald-900',
    bar_color: 'bg-emerald-500',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    bg: 'bg-rose-50 border-rose-200',
    icon_color: 'text-rose-600',
    title_color: 'text-rose-900',
    bar_color: 'bg-rose-500',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 border-amber-200',
    icon_color: 'text-amber-600',
    title_color: 'text-amber-900',
    bar_color: 'bg-amber-500',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bg: 'bg-sky-50 border-sky-200',
    icon_color: 'text-sky-600',
    title_color: 'text-sky-900',
    bar_color: 'bg-sky-500',
    label: 'Info',
  },
};

/**
 * Global toast notification component.
 * Reads from uiStore – render once near the app root.
 */
export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(clearToast, TOAST_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [toast, clearToast]);

  if (!toast) return null;

  const type = toast.type || 'info';
  const cfg = CONFIG[type] || CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed bottom-6 right-6 z-[9999] w-[calc(100%-3rem)] max-w-sm
        flex items-start gap-3 p-4 rounded-xl border shadow-xl overflow-hidden
        ${cfg.bg} toast-enter
      `}
    >
      {/* Icon */}
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${cfg.icon_color}`} />

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold uppercase tracking-wider ${cfg.icon_color}`}>
          {cfg.label}
        </p>
        <p className={`text-sm font-medium ${cfg.title_color} mt-0.5`}>
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={clearToast}
        className="rounded p-0.5 text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-1 rounded-b-xl ${cfg.bar_color} animate-shrink`}
        style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
      />

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .animate-shrink { animation: shrink linear forwards; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(1rem); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .toast-enter { animation: toastIn 0.25s ease-out both; }

        @media (prefers-reduced-motion: reduce) {
          .toast-enter, .animate-shrink { animation: none; }
        }
      `}</style>
    </div>
  );
}
