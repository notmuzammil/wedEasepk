import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { LogoMark } from '../ui';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad'];

const BROWSE_LINKS = [
  { label: 'All Venues',   to: '/venues' },
  { label: 'List a Venue', to: '/register' },
  { label: 'Sign In',      to: '/login' },
];

/**
 * Deep rosewood footer — closes the page with brand colour rather than a
 * neutral black, which read as dead weight under the ivory page body.
 * Every text tint here clears WCAG AA against the rose-950 ground.
 */
export const Footer = () => {
  return (
    <footer className="relative bg-rose-950 text-rose-100 overflow-hidden">
      {/* Gold hairline separating the footer from the page */}
      <div className="h-px w-full rule-gold opacity-70" />

      {/* Warm light bleeding in from the top edge */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-rose-800/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-72 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">

          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 font-serif text-2xl font-bold tracking-wide text-white">
              <LogoMark className="h-9 w-9" />
              <span>Wed<span className="text-gold-400">Ease</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-rose-200/85 max-w-sm">
              Pakistan&apos;s premier venue booking marketplace. Connecting couples with
              top marquees, banquet halls, and elegant lawn spaces for their big day.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-rose-200/70 pt-1">
              Made with <Heart className="h-3.5 w-3.5 text-gold-400 fill-gold-400" /> for your special day.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Browse
            </h3>
            <ul className="space-y-2.5 text-sm">
              {BROWSE_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-rose-200/85 hover:text-gold-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-white mt-7 mb-4">
              Popular Cities
            </h3>
            <ul className="space-y-2.5 text-sm">
              {CITIES.map((city) => (
                <li key={city}>
                  <Link
                    to={`/venues?city=${encodeURIComponent(city)}`}
                    className="text-rose-200/85 hover:text-gold-400 transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:support@wedease.com.pk"
                  className="text-rose-200/85 hover:text-gold-400 transition-colors break-all"
                >
                  support@wedease.com.pk
                </a>
              </li>
              <li>
                <a
                  href="https://wedease.com.pk"
                  className="text-rose-200/85 hover:text-gold-400 transition-colors"
                >
                  wedease.com.pk
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-rose-200/70">
          <p>© {new Date().getFullYear()} WedEase. All rights reserved.</p>
          <p>Created for Pakistan, with love for celebrations.</p>
        </div>
      </div>
    </footer>
  );
};
