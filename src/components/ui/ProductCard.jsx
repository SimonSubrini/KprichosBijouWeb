import React, { useState } from 'react';
import { Button } from './Button';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, X, CaretLeft, CaretRight } from '@phosphor-icons/react';

export const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [showModal, setShowModal] = useState(false);
  const [customValues, setCustomValues] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');

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

  const handleAddToCart = () => {
    // Si tiene modelos o es personalizado, obligamos a pasar por el modal
    if (product.hasModels || product.type === 'custom') {
      setShowModal(true);
    } else {
      addItem(product, 1);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    
    let totalExtraCost = 0;
    
    // Convertir el objeto de valores a un string legible y calcular el costo extra
    let customizationsString = Object.entries(customValues)
      .map(([key, value]) => {
        if (!value || value === 'Ninguno / Sin agregados') return null; // Ignoramos los "Ninguno"
        const optionDef = options.find(opt => opt.optionName === key);
        if (optionDef && optionDef.extraCost) {
          totalExtraCost += optionDef.extraCost;
          return `${key}: ${value} (+ $${optionDef.extraCost})`;
        }
        return `${key}: ${value}`;
      })
      .filter(Boolean)
      .join(' | ');

    let finalPrice = product.basePrice;
    let baseProductToCart = product;

    if (product.hasModels && selectedModel) {
      const modelDef = product.models.find(m => m.name === selectedModel);
      if (modelDef) {
        finalPrice = modelDef.price;
        customizationsString = `Modelo: ${selectedModel}` + (customizationsString ? ` | ${customizationsString}` : '');
      }
    }

    const customizedProduct = {
      ...baseProductToCart,
      basePrice: finalPrice + totalExtraCost
    };

    addItem(customizedProduct, 1, customizationsString);
    setShowModal(false);
    setCustomValues({}); // limpiar el estado para futuras compras
    setSelectedModel('');
  };

  const handleCustomChange = (optionName, val) => {
    setCustomValues(prev => ({ ...prev, [optionName]: val }));
  };

  // Asegurar que options sea un array aunque venga undefined desde Sanity
  const options = product.customizationOptions || [];
  
  // Calcular precio a mostrar
  const displayPrice = product.hasModels && product.models?.length > 0 
    ? `Desde $${Math.min(...product.models.map(m => m.price))}` 
    : `$${product.basePrice}`;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-brand-pink/20 flex flex-col h-full">
        <div className="aspect-square bg-brand-light relative overflow-hidden group">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <>
              <img 
                src={product.imageUrls[currentImageIndex]} 
                alt={product.name} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
              />
              
              {product.imageUrls.length > 1 && (
                <>
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
                </>
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
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-brand-dark mb-1 leading-tight">{product.name}</h3>
          <p className="text-sm text-brand-dark/60 mb-5 line-clamp-2 leading-relaxed">{product.description}</p>
          
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-brand-magenta font-display">
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
                product.hasModels ? 'Elegir Modelo' : 'Personalizar'
              )}
            </Button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-6 border-b border-brand-pink/20 flex justify-between items-center bg-brand-light/30">
              <h3 className="font-display font-bold text-xl text-brand-dark">Personalizar {product.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-dark/50 hover:text-brand-magenta transition-colors bg-white rounded-full p-1 shadow-sm">
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleCustomSubmit} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-6 overflow-y-auto">
                {product.hasModels && product.models?.length > 0 && (
                  <div className="space-y-5 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-brand-dark">Modelo / Tamaño</label>
                      <select 
                        required
                        className="p-3 bg-white border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                      >
                        <option value="" disabled>Selecciona un modelo</option>
                        {product.models.map((m, idx) => (
                          <option key={idx} value={m.name} disabled={m.stockCount <= 0}>
                            {m.name} - ${m.price} {m.stockCount <= 0 ? '(Sin stock)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {options.length > 0 ? (
                  <div className="space-y-5">
                    {options.map((opt, i) => {
                      if (opt.type === 'text') {
                        return (
                          <div key={i} className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-brand-dark">
                              {opt.optionName} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                            </label>
                            <textarea 
                              rows="3"
                              className="p-3 bg-white border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark resize-none"
                              placeholder={`Escribe aquí...`}
                              value={customValues[opt.optionName] || ''}
                              onChange={(e) => handleCustomChange(opt.optionName, e.target.value)}
                            />
                          </div>
                        );
                      }

                      // Sanity puede devolver strings separados por coma en "choices"
                      const choices = opt.choices ? opt.choices.split(',').map(c => c.trim()) : [];
                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-brand-dark">
                            {opt.optionName} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                          </label>
                          <select 
                            required
                            className="p-3 bg-white border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark"
                            value={customValues[opt.optionName] || ''}
                            onChange={(e) => handleCustomChange(opt.optionName, e.target.value)}
                          >
                            <option value="" disabled>Selecciona una opción</option>
                            <option value="Ninguno / Sin agregados">Ninguno / Sin agregados (+$0)</option>
                            {choices.map((c, j) => (
                              <option key={j} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-brand-dark/70 leading-relaxed">
                      Este producto se hace a medida. Por favor, especifica a continuación cómo quieres que lo diseñemos:
                    </p>
                    <textarea 
                      required
                      rows="4"
                      className="w-full p-3 bg-white border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm resize-none text-brand-dark"
                      placeholder="Ej: Letra inicial C, de color rosa pastel, con brillos dorados..."
                      value={customValues['Detalles'] || ''}
                      onChange={(e) => handleCustomChange('Detalles', e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-brand-pink/20 bg-brand-light/30 mt-auto">
                <Button type="submit" variant="primary" className="w-full py-4 text-base">
                  <ShoppingCart size={20} weight="bold" className="inline mr-2 -mt-1" />
                  Agregar al Carrito
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
