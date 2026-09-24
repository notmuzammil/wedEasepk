import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { Logo } from '../shared/Logo';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'];

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'All venues', to: '/venues' },
      { label: 'Wedding halls', to: '/venues?type=hall' },
      { label: 'Marquees', to: '/venues?type=marquee' },
      { label: 'Lawns', to: '/venues?type=lawn' },
    ],
  },
  {
    title: 'For venues',
    links: [
      { label: 'List your venue', to: '/register' },
      { label: 'Vendor login', to: '/login' },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-stone-950 text-stone-400">
      {/* Soft brand glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-rose-700/20 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 space-y-5 md:col-span-5">
            <Logo tone="light" />
            <p className="max-w-sm text-sm leading-relaxed text-stone-400">
              The easiest way to discover, compare and book wedding venues across Pakistan —
              from intimate lawns to grand banquet halls.
            </p>
            <a
              href="mailto:support@wedease.pk"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <Mail className="h-4 w-4 text-gold-300" /> support@wedease.pk
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-stone-200">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="group inline-flex items-center gap-1 transition-colors hover:text-white">
                      {l.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-3">
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-stone-200">
              Popular cities
            </h3>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Link
                  key={c}
                  to={`/venues?city=${encodeURIComponent(c)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-300 transition-colors hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-white"
                >
                  <MapPin className="h-3 w-3" /> {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} WedEase. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> for celebrations in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
};
