import React from 'react';
import { InstagramLogo, WhatsappLogo, Envelope } from '@phosphor-icons/react';

export const SobreNosotros = () => {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto animate-fade-in text-center space-y-8">
      <h2 className="text-4xl font-display font-bold text-brand-dark mb-4">Sobre Nosotros</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink/20 space-y-6">
        <img src="/logo.jpg" alt="Logo Kprichos Bijou" className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-brand-pink/50 shadow-md" />
        
        <p className="text-lg text-brand-dark/80 leading-relaxed">
          <strong>Kprichos Bijou</strong> nace de las ganas de crear accesorios únicos y personalizados. Somos de <strong>Allen, Río Negro</strong>, y hace tiempo venimos trabajando de manera artesanal con resina epóxica para dar vida a llaveros, souvenirs y accesorios llenos de color, brillo y mucho amor.
        </p>
        
        <p className="text-lg text-brand-dark/80 leading-relaxed">
          Cada pieza que creamos es única, pensada para que te des ese "capricho" que te mereces o para que hagas un regalo súper especial y hecho a medida.
        </p>
        
        <div className="pt-6 border-t border-brand-pink/30 flex justify-center gap-6">
          <a href="https://www.instagram.com/kprichosbijou" target="_blank" rel="noreferrer" className="text-brand-magenta hover:text-brand-dark transition-colors flex flex-col items-center gap-2">
            <InstagramLogo size={32} weight="fill" />
            <span className="text-sm font-medium">Instagram</span>
          </a>
          <a href="https://wa.me/5492984512271" target="_blank" rel="noreferrer" className="text-brand-magenta hover:text-brand-dark transition-colors flex flex-col items-center gap-2">
            <WhatsappLogo size={32} weight="fill" />
            <span className="text-sm font-medium">WhatsApp</span>
          </a>
          <a href="mailto:kprichosbijou@gmail.com" target="_blank" rel="noreferrer" className="text-brand-magenta hover:text-brand-dark transition-colors flex flex-col items-center gap-2">
            <Envelope size={32} weight="fill" />
            <span className="text-sm font-medium">Email</span>
          </a>
        </div>
      </div>
    </div>
  );
};
