import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
export const PageWrapper = () => {
  const { toast, clearToast } = useUiStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  const getToastIcon = () => {
    switch (toast?.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getToastStyles = () => {
    switch (toast?.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans text-stone-900 antialiased">
      <Navbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div className={`flex items-center gap-3 border p-4 rounded-xl shadow-lg max-w-sm transition-all duration-300 ${getToastStyles()}`}>
            {getToastIcon()}
            <p className="text-sm font-medium pr-4">{toast.message}</p>
            <button 
              onClick={clearToast}
              className="text-stone-400 hover:text-stone-700 ml-auto rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
