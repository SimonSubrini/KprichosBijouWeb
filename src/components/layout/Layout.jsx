import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartSidebar } from '../ui/CartSidebar';

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-light font-sans text-brand-dark">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
};
