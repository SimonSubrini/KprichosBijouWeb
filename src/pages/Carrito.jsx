import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/Button';
import { Trash, Minus, Plus } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const Carrito = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('');
  
  // Formulario Correo Argentino
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    city: '',
    postalCode: '',
    street: '',
    number: '',
    floor: '',
    phone: '',
    email: '',
    observation: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { items, removeItem, getCartTotal, getCartDiscount, updateQuantity, clearCart } = useCartStore();
  const total = getCartTotal();
  const discount = getCartDiscount();
  const finalTotal = total - discount;

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
    
    message += `\n*Subtotal:* $${total}\n`;
    if (discount > 0) {
      message += `*Descuento Mayorista:* -$${discount}\n`;
    }
    message += `*Total Estimado:* $${finalTotal}\n\n`;

    if (shippingMethod === 'correo') {
      message += `*Envío:* Correo Argentino\n`;
      message += `*Nombre:* ${formData.name}\n`;
      message += `*Provincia:* ${formData.province}\n`;
      message += `*Localidad:* ${formData.city}\n`;
      message += `*C.P.:* ${formData.postalCode}\n`;
      message += `*Dirección:* ${formData.street} ${formData.number} ${formData.floor ? `(Piso/Dpto: ${formData.floor})` : ''}\n`;
      message += `*Teléfono:* ${formData.phone}\n`;
      message += `*Email:* ${formData.email}\n`;
      if (formData.observation) {
        message += `*Observación:* ${formData.observation}\n`;
      }
      message += `\n`;
    } else if (shippingMethod === 'local') {
      message += `*Envío:* Retiro por local (Allen, Río Negro)\n\n`;
    }
    message += `*Total (sin envio):* $${finalTotal}\n\n`;
    
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
          <Link to="/productos">
            <Button variant="primary">Ir a Productos</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
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
                    
                    <div className="flex flex-col items-end ml-4 min-w-[80px]">
                      {item.quantity >= 10 ? (
                        <>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-brand-dark/40 line-through">
                              ${item.product.basePrice * item.quantity}
                            </span>
                            <span className="text-[10px] bg-brand-magenta/10 text-brand-magenta px-1.5 py-0.5 rounded font-bold">
                              -{item.quantity >= 20 ? '15%' : '10%'}
                            </span>
                          </div>
                          <span className="font-bold font-display text-brand-magenta text-lg whitespace-nowrap">
                            ${(item.product.basePrice * item.quantity * (item.quantity >= 20 ? 0.85 : 0.90)).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold font-display text-brand-magenta text-lg whitespace-nowrap">
                          ${item.product.basePrice * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-brand-pink/20 h-fit sticky top-24">
            <h3 className="text-xl font-bold font-display text-brand-dark mb-5">Opciones de Envío</h3>
            
            <div className="flex flex-col gap-3 mb-6">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-brand-pink/30 hover:bg-brand-light/30 transition-colors">
                <input 
                  type="radio" 
                  name="shipping" 
                  value="local"
                  checked={shippingMethod === 'local'}
                  onChange={() => setShippingMethod('local')}
                  className="mt-1 accent-brand-magenta"
                />
                <div>
                  <span className="block font-semibold text-brand-dark text-sm">Retiro en Domicilio</span>
                  <span className="block text-xs text-brand-dark/60 mt-0.5">Allen, Río Negro (Gratis)</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-brand-pink/30 hover:bg-brand-light/30 transition-colors">
                <input 
                  type="radio" 
                  name="shipping" 
                  value="correo"
                  checked={shippingMethod === 'correo'}
                  onChange={() => setShippingMethod('correo')}
                  className="mt-1 accent-brand-magenta"
                />
                <div>
                  <span className="block font-semibold text-brand-dark text-sm">Envío por Correo Argentino</span>
                  <span className="block text-xs text-brand-dark/60 mt-0.5">Costo a cargo del comprador</span>
                </div>
              </label>
            </div>

            {shippingMethod === 'correo' && (
              <div className="mb-6 space-y-4 p-4 bg-brand-light/20 rounded-xl border border-brand-pink/30 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Nombre y Apellido *</label>
                  <input type="text" required name="name" value={formData.name} onChange={handleFormChange} placeholder="Ej: Maria Lopez" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Provincia *</label>
                  <input type="text" required name="province" value={formData.province} onChange={handleFormChange} placeholder="Ej: Río Negro" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Localidad *</label>
                  <input type="text" required name="city" value={formData.city} onChange={handleFormChange} placeholder="Ej: General Roca" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Código Postal *</label>
                  <input type="text" required name="postalCode" value={formData.postalCode} onChange={handleFormChange} placeholder="Ej: 8332" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Calle *</label>
                  <input type="text" required name="street" value={formData.street} onChange={handleFormChange} placeholder="Ej: San Martin" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Altura *</label>
                  <input type="text" required name="number" value={formData.number} onChange={handleFormChange} placeholder="Ej: 1234" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Piso / Depto</label>
                  <input type="text" name="floor" value={formData.floor} onChange={handleFormChange} placeholder="Ej: 2B" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Teléfono / Celular *</label>
                  <input type="tel" required name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Ej: +54 9 298 1234567" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Correo Electrónico *</label>
                  <input type="email" required name="email" value={formData.email} onChange={handleFormChange} placeholder="Ej: correo@ejemplo.com" className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Observaciones</label>
                  <textarea name="observation" value={formData.observation} onChange={handleFormChange} placeholder="Aclaraciones para el envío..." className="w-full p-2 text-sm border border-brand-pink/50 rounded-lg focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta resize-none" rows="2" />
                </div>
              </div>
            )}

            <h3 className="text-xl font-bold font-display text-brand-dark mb-5 border-t border-brand-pink/30 pt-6">Resumen de Compra</h3>
            <div className="flex justify-between text-brand-dark mb-1 text-sm">
              <span>Subtotal (Sin envío)</span>
              <span className="font-medium">${total}</span>
            </div>
            <div className="flex justify-between text-brand-dark/70 text-xs mb-3">
              <span>Precio sin impuestos</span>
              <span>${(finalTotal / 1.21).toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-magenta font-bold mb-3 text-sm">
                <span>Descuento Mayorista</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-dark/70 text-sm mb-5 pb-5 border-b border-brand-pink/30">
              <span>Costo de Envío</span>
              <span>A coordinar</span>
            </div>
            <div className="flex justify-between font-bold text-2xl font-display text-brand-dark mb-6">
              <span>Total</span>
              <span className="text-brand-magenta">${finalTotal}</span>
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
