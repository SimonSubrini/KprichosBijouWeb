import React from 'react';

export const Envios = () => {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto animate-fade-in text-center space-y-8">
      <h2 className="text-4xl font-display font-bold text-brand-dark mb-4">Envíos</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink/20">
        <p className="text-lg text-brand-dark/80 mb-6">
          Realizamos envíos a todo el país a través de <strong>Correo Argentino</strong>. El costo de envío corre por cuenta del comprador y se abona al momento de coordinar el pago.
        </p>
        <p className="text-lg text-brand-dark/80">
          Si sos de <strong>Allen, Río Negro</strong> o alrededores, podés retirar tu pedido sin costo adicional o coordinamos un punto de encuentro.
        </p>
      </div>
    </div>
  );
};
