import React from 'react';
import { ShoppingCart, List } from '@phosphor-icons/react';
import { useCartStore } from '../../store/cartStore';
import { Link } from 'react-router-dom';

export const Header = () => {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-brand-pink/30">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-brand-dark p-1 hover:text-brand-magenta transition-colors">
            <List size={28} />
          </button>
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.jpg" alt="Kprichos Bijou Logo" className="w-12 h-12 rounded-full object-cover border-2 border-brand-pink group-hover:border-brand-magenta transition-colors" />
            <span className="font-display font-bold text-xl text-brand-dark hidden sm:block group-hover:text-brand-magenta transition-colors">Kprichos Bijou</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-medium text-brand-dark">
          <Link to="/" className="hover:text-brand-magenta transition-colors">Inicio</Link>
          <Link to="/catalogo" className="hover:text-brand-magenta transition-colors">Catálogo</Link>
          <Link to="/nosotros" className="hover:text-brand-magenta transition-colors">Nosotros</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/carrito" className="relative p-2 text-brand-dark hover:text-brand-magenta transition-colors">
            <ShoppingCart size={28} weight="duotone" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-magenta rounded-full shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
