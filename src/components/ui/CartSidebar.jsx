import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Button } from './Button';
import { X, Trash, ShoppingCart, Minus, Plus, WarningCircle } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';

export const CartSidebar = () => {
  const { items, isSidebarOpen, closeSidebar, removeItem, getCartTotal, getCartDiscount, updateQuantity } = useCartStore();
  const { customOrdersSuspended } = useSettingsStore();
  const navigate = useNavigate();

  if (!isSidebarOpen) return null;

  const total = getCartTotal();
  const discount = getCartDiscount();
  const finalTotal = total - discount;

  const hasBlockedCustomItems = customOrdersSuspended && items.some(i => i.product?.type === 'custom');

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
            items.map((item) => {
              const isBlockedCustom = customOrdersSuspended && item.product?.type === 'custom';
              return (
              <div key={item.id} className={`flex gap-4 p-3 rounded-xl border shadow-sm relative pr-10 ${isBlockedCustom ? 'bg-brand-light/50 border-brand-magenta' : 'bg-white border-brand-pink/20'}`}>
                <div className="w-16 h-16 bg-brand-light rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                    <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-pink text-[10px] font-display">Sin foto</div>
                  )}
                </div>
                <div className="flex flex-col flex-grow justify-center">
                  <h4 className="font-bold text-brand-dark text-sm leading-tight line-clamp-1 flex items-center gap-1">
                    {item.product.name}
                  </h4>
                  {isBlockedCustom && (
                    <span className="text-[10px] font-bold text-white bg-brand-magenta px-1.5 py-0.5 rounded w-fit my-0.5 flex items-center gap-0.5">
                      <WarningCircle size={12} weight="fill" /> Suspendido momentáneamente
                    </span>
                  )}
                  <p className="text-xs text-brand-dark/60 mb-1 leading-tight line-clamp-1">{item.customizations || 'Sin personalización'}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 bg-brand-light/50 rounded-full border border-brand-pink/30 px-1.5 py-0.5">
                      <button 
                        onClick={() => item.quantity > 1 && updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className={`w-5 h-5 flex items-center justify-center rounded-full shadow-sm transition-colors ${item.quantity <= 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-brand-dark hover:text-brand-magenta bg-white'}`}
                      ><Minus size={10} weight="bold"/></button>
                      <span className="font-medium text-xs min-w-[16px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          const maxAllowed = item.product.maxAllowed ?? Infinity;
                          if (item.quantity < maxAllowed) {
                            updateQuantity(item.id, 1);
                          } else {
                            alert("No hay más stock disponible para este producto o uno de sus accesorios.");
                          }
                        }}
                        className="text-brand-dark hover:text-brand-magenta w-5 h-5 flex items-center justify-center rounded-full bg-white shadow-sm"
                      ><Plus size={10} weight="bold"/></button>
                    </div>
                    <div className="flex flex-col items-end">
                      {item.quantity >= 10 ? (
                        <>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[10px] text-brand-dark/40 line-through">
                              ${item.product.basePrice * item.quantity}
                            </span>
                            <span className="text-[9px] bg-brand-magenta/10 text-brand-magenta px-1 rounded font-bold">
                              -{item.quantity >= 20 ? '15%' : '10%'}
                            </span>
                          </div>
                          <span className="font-bold font-display text-brand-magenta text-sm">
                            ${(item.product.basePrice * item.quantity * (item.quantity >= 20 ? 0.85 : 0.90)).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold font-display text-brand-magenta text-sm">
                          ${item.product.basePrice * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-pink hover:text-brand-magenta transition-colors p-1"
                >
                  <Trash size={18} weight="fill" />
                </button>
              </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-brand-pink/30 bg-brand-light/30">
            {hasBlockedCustomItems && (
              <div className="p-3 mb-3 bg-brand-light/80 border border-brand-pink rounded-xl text-xs text-brand-dark font-medium flex items-center gap-2">
                <WarningCircle size={20} weight="fill" className="text-brand-magenta flex-shrink-0" />
                <span>Tienes ítems personalizados suspendidos. Elimínalos en el carrito para comprar tus productos en stock.</span>
              </div>
            )}
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
              <span>Total (sin envío)</span>
              <span className="text-brand-magenta">${finalTotal}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button variant="primary" className="w-full justify-center" onClick={handleCheckoutClick}>
                Ver Carrito / Pagar
              </Button>
              <Button variant="outline" className="w-full justify-center" onClick={closeSidebar}>
                Cerrar Panel
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
