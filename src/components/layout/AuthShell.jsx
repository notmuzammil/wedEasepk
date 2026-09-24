import React from 'react';
import PropTypes from 'prop-types';
import { Star, ShieldCheck } from 'lucide-react';
import { Logo } from '../shared/Logo';

const AUTH_IMAGE =
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1400';

/**
 * Split-screen shell shared by Login and Register: editorial photo panel on
 * the left (desktop), form card on the right.
 */
export function AuthShell({ title, subtitle, children, footer, quote }) {
  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Editorial panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={AUTH_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/85 via-rose-900/60 to-stone-950/80" />
        <div className="bg-grain absolute inset-0 opacity-40" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16 text-white">
          <Logo tone="light" size="lg" to={null} />

          <div className="max-w-md space-y-6">
            <p className="font-serif text-4xl font-semibold leading-tight text-white xl:text-5xl">
              Your dream wedding, <span className="italic text-gold-300">beautifully</span> booked.
            </p>
            <p className="text-lg leading-relaxed text-rose-100/90">{quote}</p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-md">
            <div className="flex -space-x-2">
              {['A', 'M', 'K'].map((l, i) => (
                <span
                  key={l}
                  className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ring-2 ring-rose-900 ${
                    ['bg-rose-200 text-rose-800', 'bg-gold-200 text-gold-800', 'bg-emerald-200 text-emerald-800'][i]
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-0.5 text-gold-300">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-0.5 text-rose-100">Trusted by couples &amp; venues across Pakistan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden lg:hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-gold-100/80 blur-3xl" />
        </div>

        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-stone-900/5 sm:p-9">
            <div className="mb-7 space-y-2">
              <h1 className="font-serif text-3xl font-semibold text-stone-900">{title}</h1>
              {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
            </div>
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm text-stone-500">{footer}</div>}

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure, encrypted sign-in
          </p>
        </div>
      </div>
    </div>
  );
}

AuthShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  quote: PropTypes.string,
};

export default AuthShell;
