import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { Button } from './Button';
import { X, Trash, ShoppingCart } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';

export const CartSidebar = () => {
  const { items, isSidebarOpen, closeSidebar, removeItem, getCartTotal, getCartDiscount } = useCartStore();
  const navigate = useNavigate();

  if (!isSidebarOpen) return null;

  const total = getCartTotal();
  const discount = getCartDiscount();
  const finalTotal = total - discount;

  const handleCheckoutClick = () => {
    closeSidebar();
    navigate('/carrito');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-brand-dark/30 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={closeSidebar}
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col animate-slide-left">
        <div className="flex items-center justify-between p-5 border-b border-brand-pink/30 bg-brand-light/30">
          <h2 className="font-display font-bold text-xl text-brand-dark flex items-center gap-2">
            <ShoppingCart size={24} /> Tu Carrito
          </h2>
          <button 
            onClick={closeSidebar} 
            className="text-brand-dark/50 hover:text-brand-magenta transition-colors bg-white rounded-full p-2 shadow-sm"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-dark/60">
              <ShoppingCart size={48} className="text-brand-pink mb-4" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl border border-brand-pink/20 shadow-sm relative pr-10">
                <div className="w-16 h-16 bg-brand-light rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                    <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-pink text-[10px] font-display">Sin foto</div>
                  )}
                </div>
                <div className="flex flex-col flex-grow justify-center">
                  <h4 className="font-bold text-brand-dark text-sm leading-tight line-clamp-1">{item.product.name}</h4>
                  <p className="text-xs text-brand-dark/60 mb-1">Cant: {item.quantity}</p>
                  <span className="font-bold font-display text-brand-magenta text-sm">
                    ${item.product.basePrice * item.quantity}
                  </span>
                </div>
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-pink hover:text-brand-magenta transition-colors p-1"
                >
                  <Trash size={18} weight="fill" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-brand-pink/30 bg-brand-light/30">
            <div className="flex justify-between text-brand-dark mb-2 text-sm">
              <span>Subtotal</span>
              <span className="font-medium">${total}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-magenta font-bold mb-2 text-sm">
                <span>Descuento Mayorista</span>
                <span>-${discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl font-display text-brand-dark mb-5 border-t border-brand-pink/30 pt-3">
              <span>Total Estimado</span>
              <span className="text-brand-magenta">${finalTotal}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button variant="primary" className="w-full justify-center" onClick={handleCheckoutClick}>
                Continuar compra
              </Button>
              <Button variant="outline" className="w-full justify-center" onClick={closeSidebar}>
                Seguir comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
