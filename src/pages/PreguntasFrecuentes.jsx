import React from 'react';

export const PreguntasFrecuentes = () => {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto animate-fade-in text-center space-y-8">
      <h2 className="text-4xl font-display font-bold text-brand-dark mb-4">Preguntas Frecuentes</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink/20 text-left space-y-8">
        
        <div>
          <h3 className="text-xl font-bold text-brand-dark mb-2">¿Cuánto tardan en preparar un pedido personalizado?</h3>
          <p className="text-brand-dark/70">Como los productos de resina requieren tiempo de curado y elaboración artesanal, solemos demorar entre 3 a 7 días hábiles dependiendo de la complejidad y la demanda actual.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-brand-dark mb-2">¿Qué métodos de pago aceptan?</h3>
          <p className="text-brand-dark/70">Aceptamos transferencias bancarias, Mercado Pago y efectivo (si retiras por nuestro punto en Allen).</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-brand-dark mb-2">¿Se puede mojar la resina?</h3>
          <p className="text-brand-dark/70">Sí, la resina epóxica es resistente al agua, pero recomendamos no exponerla prolongadamente a altas temperaturas o productos químicos fuertes para mantener su brillo intacto.</p>
        </div>

      </div>
    </div>
  );
};
