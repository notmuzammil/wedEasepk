import React from 'react';
import { useAuth } from './hooks/useAuth';
import { AppRouter } from './routes/AppRouter';
import { Toast } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Root component — mounts the auth listener before any route renders.
 * useAuth() subscribes to Supabase auth events and syncs Zustand store.
 */
function App() {
  useAuth(); // bootstraps session + auth state change subscription
  return (
    <ErrorBoundary>
      <AppRouter />
      <Toast />
    </ErrorBoundary>
  );
}

export default App;
