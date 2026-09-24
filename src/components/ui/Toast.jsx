import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const TOAST_DURATION_MS = 4000;

const CONFIG = {
  success: { icon: CheckCircle2, tint: 'text-emerald-600 bg-emerald-50', bar: 'bg-emerald-500', label: 'Success' },
  error:   { icon: XCircle,      tint: 'text-red-600 bg-red-50',         bar: 'bg-red-500',     label: 'Something went wrong' },
  warning: { icon: AlertTriangle, tint: 'text-amber-600 bg-amber-50',    bar: 'bg-amber-500',   label: 'Heads up' },
  info:    { icon: Info,         tint: 'text-sky-600 bg-sky-50',         bar: 'bg-sky-500',     label: 'Info' },
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
      // Re-key on message so the enter animation + progress bar restart
      key={`${type}-${toast.message}`}
      role="alert"
      aria-live="polite"
      className="
        fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[9999] sm:w-full sm:max-w-sm
        flex items-start gap-3 overflow-hidden rounded-2xl bg-white/95 p-4 pr-3 backdrop-blur-xl
        shadow-lift ring-1 ring-stone-900/5
        animate-in fade-in-0 slide-in-from-bottom-4 sm:slide-in-from-right-8 duration-300
      "
    >
      <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${cfg.tint}`}>
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-stone-900">{cfg.label}</p>
        <p className="mt-0.5 text-sm text-stone-600 break-words">{toast.message}</p>
      </div>

      <button
        onClick={clearToast}
        className="flex-shrink-0 rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      <span
        className={`absolute bottom-0 left-0 h-[3px] ${cfg.bar} animate-toast-shrink`}
        style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
      />

      <style>{`
        @keyframes toast-shrink { from { width: 100%; } to { width: 0%; } }
        .animate-toast-shrink { animation: toast-shrink linear forwards; }
      `}</style>
    </div>
  );
}
