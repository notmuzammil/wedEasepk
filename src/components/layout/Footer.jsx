import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-gold-500/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <span className="flex items-center space-x-2 font-serif text-2xl font-bold tracking-wide text-white">
              <Sparkles className="h-6 w-6 text-gold-500 fill-gold-500/30" />
              <span>Shaadi<span className="text-gold-500">Spaces</span></span>
            </span>
            <p className="text-sm text-stone-400 max-w-sm">
              The premier venue booking marketplace in Karachi. Connecting couples with top marquees, banquet halls, and elegant lawn spaces for their big day.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-stone-100 font-semibold text-sm uppercase tracking-wider mb-4 font-serif">Popular Areas</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Clifton</li>
              <li>DHA Karachi</li>
              <li>Gulshan-e-Iqbal</li>
              <li>North Nazimabad</li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-stone-100 font-semibold text-sm uppercase tracking-wider mb-4 font-serif">Support</h3>
            <p className="text-sm text-stone-400">
              Email: support@shaadispaces.pk
            </p>
            <p className="text-sm text-stone-400 mt-2">
              Phone: +92 21 111-SHAADI
            </p>
            <p className="text-xs text-stone-500 mt-4">
              © {new Date().getFullYear()} WedEasepk. All rights reserved.
            </p>
          </div>
          
        </div>
        
        <div className="mt-8 border-t border-stone-850 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>Created for Karachi, with love for celebrations.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Made with <Heart className="h-3 w-3 text-gold-500 fill-gold-500" /> for your special day.
          </p>
        </div>
      </div>
    </footer>
  );
};
