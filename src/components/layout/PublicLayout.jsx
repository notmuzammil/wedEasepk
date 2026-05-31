import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * PublicLayout maps public routes with Navbar & Footer.
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 font-sans antialiased">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
