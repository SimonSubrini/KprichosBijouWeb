import React from 'react';
import { InstagramLogo, WhatsappLogo, Envelope } from '@phosphor-icons/react';

export const Footer = () => {
  return (
    <footer id="footer" className="bg-brand-pink/20 pt-12 pb-8 border-t border-brand-pink/50 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Kprichos Bijou Logo" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-display font-bold text-lg text-brand-dark">Kprichos Bijou</span>
          </div>
          <p className="text-sm text-brand-dark/70 text-center md:text-left max-w-xs leading-relaxed">
            Llaveros, souvenirs y accesorios únicos en resina epóxica. Hechos a mano con amor.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
          <h4 className="font-semibold text-brand-dark">Síguenos</h4>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/kprichosbijou" target="_blank" rel="noreferrer" className="text-brand-magenta hover:text-white transition-colors p-2 bg-white hover:bg-brand-magenta rounded-full shadow-sm hover:shadow-md">
              <InstagramLogo size={24} weight="fill" />
            </a>
            <a href="https://wa.me/5492984512271" target="_blank" rel="noreferrer" className="text-brand-magenta hover:text-white transition-colors p-2 bg-white hover:bg-brand-magenta rounded-full shadow-sm hover:shadow-md">
              <WhatsappLogo size={24} weight="fill" />
            </a>
            <a href="mailto:kprichosbijou@gmail.com" target="_blank" rel="noreferrer" className="text-brand-magenta hover:text-white transition-colors p-2 bg-white hover:bg-brand-magenta rounded-full shadow-sm hover:shadow-md">
              <Envelope size={24} weight="fill" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
