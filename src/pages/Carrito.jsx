import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/Button';
import { Trash, Minus, Plus } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const Carrito = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, removeItem, getCartTotal, updateQuantity, clearCart } = useCartStore();
  const total = getCartTotal();

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // 1. Guardar orden y restar stock en Sanity vía nuestro Backend
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Aviso backend:", data.message);
      }
    } catch (err) {
      console.error("No se pudo conectar al API:", err);
    }

    // 2. Redirigir a WhatsApp
    const phoneNumber = "5492984512271"; 
    
    let message = "Hola Kprichos Bijou! Me gustaría realizar el siguiente pedido:\n\n";
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.product.name} ($${item.product.basePrice * item.quantity})\n`;
      if (item.customizations) {
        message += `  Personalización: ${item.customizations}\n`;
      }
    });
    
    message += `\n*Total Estimado: $${total}*\n\n`;
    message += "Quedo a la espera para coordinar el pago y envío. ¡Gracias!";
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    
    // 3. Vaciar carrito y quitar estado de carga
    clearCart();
    setIsProcessing(false);
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 animate-fade-in">
      <h2 className="text-4xl font-display font-bold text-brand-dark mb-8">Tu Carrito</h2>
      
      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-brand-pink/20">
          <h3 className="text-2xl font-display text-brand-dark mb-3">Tu carrito está vacío</h3>
          <p className="text-brand-dark/60 mb-6">Aún no has agregado ningún capricho a tu carrito.</p>
          <Link to="/catalogo">
            <Button variant="primary">Ir al Catálogo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-brand-pink/20">
                <div className="w-24 h-24 bg-brand-light rounded-xl overflow-hidden flex-shrink-0">
                  {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                    <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-pink text-xs font-display">Sin imagen</div>
                  )}
                </div>
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-brand-dark text-lg leading-tight">{item.product.name}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-brand-pink hover:text-brand-magenta transition-colors">
                        <Trash size={22} weight="fill" />
                      </button>
                    </div>
                    {item.customizations && (
                      <p className="text-sm text-brand-dark/60 mt-1">
                        <span className="font-semibold">Personalización:</span> {item.customizations}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 bg-brand-light/50 rounded-full border border-brand-pink/30 px-2 py-1">
                      <button 
                        onClick={() => item.quantity > 1 && updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className={`w-6 h-6 flex items-center justify-center rounded-full shadow-sm transition-colors ${item.quantity <= 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-brand-dark hover:text-brand-magenta bg-white'}`}
                      ><Minus size={12} weight="bold"/></button>
                      <span className="font-medium text-sm min-w-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-brand-dark hover:text-brand-magenta w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm"
                      ><Plus size={12} weight="bold"/></button>
                    </div>
                    <span className="font-bold font-display text-brand-magenta text-lg whitespace-nowrap shrink-0 text-right ml-4 min-w-[70px]">
                      ${item.product.basePrice * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-pink/20 h-fit sticky top-24">
            <h3 className="text-xl font-bold font-display text-brand-dark mb-5">Resumen de Compra</h3>
            <div className="flex justify-between text-brand-dark mb-1">
              <span>Subtotal (Sin envío)</span>
              <span className="font-medium">${total}</span>
            </div>
            <div className="flex justify-between text-brand-dark/70 text-sm mb-3">
              <span>Precio sin impuestos</span>
              <span>${(total * 0.79).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-brand-dark/70 text-sm mb-5 pb-5 border-b border-brand-pink/30">
              <span>Envío</span>
              <span>A coordinar</span>
            </div>
            <div className="flex justify-between font-bold text-2xl font-display text-brand-dark mb-6">
              <span>Total</span>
              <span className="text-brand-magenta">${total}</span>
            </div>
            <Button variant="primary" className="w-full py-4 text-lg" onClick={handleCheckout} disabled={isProcessing}>
              {isProcessing ? 'Procesando...' : 'Finalizar Compra'}
            </Button>
            <p className="text-xs text-center text-brand-dark/60 mt-4 leading-relaxed">
              Al hacer clic, te enviaremos a WhatsApp para coordinar el pago y los detalles del envío.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
