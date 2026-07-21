import React, { useState } from 'react';
import { Button } from './Button';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';

export const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.imageUrls) {
      setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.imageUrls) {
      setCurrentImageIndex((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Si tiene modelos o es personalizado, redirigimos a la página de detalles
    if (product.hasModels || product.type === 'custom') {
      navigate(`/producto/${product._id}`);
    } else {
      addItem(product, 1);
    }
  };

  // Calcular precio a mostrar
  const displayPrice = product.hasModels && product.models?.length > 0 
    ? `Desde $${Math.min(...product.models.map(m => m.price))}` 
    : `$${product.basePrice}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-brand-pink/20 flex flex-col h-full cursor-pointer relative">
      <Link to={`/producto/${product._id}`} className="absolute inset-0 z-0"></Link>
      
      <div className="aspect-square bg-brand-light relative overflow-hidden group z-10 pointer-events-none">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <>
            <img 
              src={product.imageUrls[currentImageIndex]} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
            />
            
            {product.imageUrls.length > 1 && (
              <div className="pointer-events-auto">
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-brand-dark p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white hover:text-brand-magenta"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-brand-dark p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white hover:text-brand-magenta"
                >
                  <CaretRight size={20} weight="bold" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {product.imageUrls.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-brand-magenta' : 'bg-white/60'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-pink">
            <span className="font-display italic text-sm">Sin imagen</span>
          </div>
        )}
        {product.type === 'custom' && (
          <span className="absolute top-3 right-3 bg-brand-magenta text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-sm">
            A pedido
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow z-10 pointer-events-none">
        <h3 className="text-lg font-bold text-brand-dark mb-1 leading-tight">{product.name}</h3>
        <p className="text-sm text-brand-dark/60 mb-5 line-clamp-2 leading-relaxed">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-between pointer-events-auto">
          <span className="text-xl font-bold text-brand-magenta font-display pointer-events-none">
            {displayPrice}
          </span>
          <Button 
            variant={!product.hasModels && product.type === 'stock' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={handleAddToCart}
            className="flex gap-2"
          >
            {!product.hasModels && product.type === 'stock' ? (
              <><ShoppingCart size={18} weight="bold" /> Agregar</>
            ) : (
              product.hasModels ? 'Elegir Modelo' : 'Ver Detalles'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
