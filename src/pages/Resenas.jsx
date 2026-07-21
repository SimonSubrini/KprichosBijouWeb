import React from 'react';

export const Resenas = () => {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto animate-fade-in text-center space-y-8">
      <h2 className="text-4xl font-display font-bold text-brand-dark mb-4">Reseñas</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink/20">
        <p className="text-lg text-brand-dark/80 mb-6">
          Próximamente estaremos subiendo fotos y comentarios de clientes felices que ya tienen sus caprichos en casa. ✨
        </p>
        <p className="text-brand-dark/60 text-sm">
          ¿Ya tenés un accesorio nuestro? Etiquetanos en Instagram para aparecer acá.
        </p>
      </div>
    </div>
  );
};
