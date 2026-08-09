import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

/**
 * 404 Not Found page — shown for unmatched routes.
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      {/* Decorative number */}
      <div className="relative select-none mb-6">
        <span
          className="text-[9rem] sm:text-[12rem] font-black leading-none text-stone-200 tracking-tighter"
          aria-hidden="true"
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="h-14 w-14 text-rose-700/40" />
        </div>
      </div>

      {/* Message */}
      <h1 className="font-serif text-3xl font-bold text-stone-900 sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-stone-500 text-sm leading-relaxed">
        The page you're looking for doesn't exist, may have been moved, or the
        URL might be incorrect.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
