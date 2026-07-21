import React from 'react';

export const ComoComprar = () => {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto animate-fade-in text-center space-y-8">
      <h2 className="text-4xl font-display font-bold text-brand-dark mb-4">¿Cómo comprar?</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink/20 text-left space-y-6">
        <div className="flex gap-4">
          <span className="text-3xl font-display text-brand-magenta font-bold">1</span>
          <div>
            <h3 className="text-xl font-bold text-brand-dark mb-1">Explora nuestro Catálogo</h3>
            <p className="text-brand-dark/70">Navega por nuestros productos en stock o personalizables.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="text-3xl font-display text-brand-magenta font-bold">2</span>
          <div>
            <h3 className="text-xl font-bold text-brand-dark mb-1">Añade al Carrito</h3>
            <p className="text-brand-dark/70">Elige las opciones de personalización (si aplican) y agrégalo a tu carrito.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="text-3xl font-display text-brand-magenta font-bold">3</span>
          <div>
            <h3 className="text-xl font-bold text-brand-dark mb-1">Finaliza por WhatsApp</h3>
            <p className="text-brand-dark/70">Al finalizar, te redirigiremos a WhatsApp con tu pedido armado para coordinar el pago y envío de forma personalizada y segura.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
