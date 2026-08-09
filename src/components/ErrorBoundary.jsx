import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Class-based error boundary.
 * Wrap critical subtrees to prevent a single component crash
 * from taking down the whole page.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeWidget />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            Something went wrong
          </h2>
          <p className="max-w-sm text-sm text-stone-500">
            {this.props.fallbackMessage ||
              'An unexpected error occurred. Please try refreshing this section.'}
          </p>
        </div>

        {import.meta.env.DEV && this.state.error && (
          <pre className="max-w-lg overflow-auto rounded-lg bg-stone-100 p-4 text-left text-xs text-stone-700">
            {this.state.error.toString()}
          </pre>
        )}

        <button
          onClick={this.handleReset}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }
}
