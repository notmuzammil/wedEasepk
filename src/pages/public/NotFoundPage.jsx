import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';

/**
 * 404 Not Found page — shown for unmatched routes.
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ivory px-4 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold-100/70 blur-3xl" />
      </div>

      <div className="absolute left-4 top-4 sm:left-8 sm:top-6">
        <Logo />
      </div>

      <div className="relative animate-fade-up">
        <p className="select-none font-serif text-[8rem] font-semibold leading-none tracking-tighter text-gradient sm:text-[11rem]" aria-hidden="true">
          404
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">
          This page skipped the wedding
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to planning.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <Link
            to="/venues"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 active:scale-95"
          >
            <Search className="h-4 w-4" /> Browse venues
          </Link>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-rose-700 active:scale-95"
          >
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
