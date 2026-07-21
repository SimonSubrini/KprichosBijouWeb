import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../lib/sanity';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/Button';
import { ShoppingCart, CaretLeft, CaretRight, Minus, Plus, ArrowLeft } from '@phosphor-icons/react';
import { PortableText } from '@portabletext/react';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for customization
  const [customValues, setCustomValues] = useState({});
  const [selectedModel, setSelectedModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-brand-magenta rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Producto no encontrado</h2>
        <Button onClick={() => navigate('/productos')} variant="primary">Volver al catálogo</Button>
      </div>
    );
  }

  const nextImage = () => {
    if (product.imageUrls) {
      setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (product.imageUrls) {
      setCurrentImageIndex((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
    }
  };

  const handleCustomChange = (optionName, val) => {
    setCustomValues(prev => ({ ...prev, [optionName]: val }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    // Validar modelo si es obligatorio
    if (product.hasModels && !selectedModel) {
      alert("Por favor, selecciona un modelo/tamaño.");
      return;
    }

    let totalExtraCost = 0;
    const options = product.customizationOptions || [];
    
    // Parse custom values
    let customizationsString = Object.entries(customValues)
      .map(([key, value]) => {
        if (!value || value === 'Ninguno / Sin agregados') return null;
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

    if (product.hasModels && selectedModel) {
      const modelDef = product.models.find(m => m.name === selectedModel);
      if (modelDef) {
        finalPrice = modelDef.price;
        customizationsString = `Modelo: ${selectedModel}` + (customizationsString ? ` | ${customizationsString}` : '');
      }
    }

    const customizedProduct = {
      ...product,
      basePrice: finalPrice + totalExtraCost
    };

    addItem(customizedProduct, quantity, customizationsString);
    navigate('/productos'); // Opcional: volver al catálogo después de agregar
  };

  const options = product.customizationOptions || [];
  
  let displayPrice = `$${product.basePrice}`;
  if (product.hasModels) {
    if (selectedModel) {
      const mDef = product.models.find(m => m.name === selectedModel);
      if (mDef) displayPrice = `$${mDef.price}`;
    } else if (product.models && product.models.length > 0) {
      displayPrice = `Desde $${Math.min(...product.models.map(m => m.price))}`;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-brand-dark/70 hover:text-brand-magenta transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Lado Izquierdo: Galería de imágenes */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto bg-white rounded-3xl p-4 shadow-sm border border-brand-pink/20 relative group h-fit">
          <div className="aspect-square bg-brand-light rounded-2xl overflow-hidden relative">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <>
                <img 
                  src={product.imageUrls[currentImageIndex]} 
                  alt={product.name} 
                  className="object-cover w-full h-full" 
                />
                
                {product.imageUrls.length > 1 && (
                  <>
                    <button 
                      type="button"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-brand-dark p-2 rounded-full shadow-sm hover:bg-brand-magenta hover:text-white transition-all"
                    >
                      <CaretLeft size={24} weight="bold" />
                    </button>
                    <button 
                      type="button"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-brand-dark p-2 rounded-full shadow-sm hover:bg-brand-magenta hover:text-white transition-all"
                    >
                      <CaretRight size={24} weight="bold" />
                    </button>
                    
                    {/* Miniaturas */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.imageUrls.map((_, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors shadow-sm ${idx === currentImageIndex ? 'bg-brand-magenta' : 'bg-white/70 hover:bg-white'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-pink font-display italic">
                Sin imagen disponible
              </div>
            )}
            
          </div>
        </div>

        {/* Lado Derecho: Detalles y Formulario */}
        <div className="lg:col-span-7 flex flex-col">
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-brand-dark mb-2 leading-tight">
            {product.name}
          </h1>
          
          <div className="text-2xl lg:text-3xl font-display font-bold text-brand-magenta mb-6">
            {displayPrice}
          </div>

          {/* Renderizado de Descripción Larga (Sanity Portable Text) */}
          {product.longDescription && (
            <div className="prose prose-sm lg:prose-base prose-pink text-brand-dark/80 mb-8 max-w-none">
              <PortableText value={product.longDescription} />
            </div>
          )}
          
          <form onSubmit={handleAddToCart} className="space-y-6 flex-grow flex flex-col">
            <div className="space-y-6 flex-grow">
              
              {/* Selector de Modelos */}
              {product.hasModels && product.models?.length > 0 && (
                <div className="flex flex-col gap-2 p-5 bg-brand-light/30 rounded-2xl border border-brand-pink/30">
                  <label className="text-sm font-bold text-brand-dark flex justify-between">
                    <span>Modelo / Tamaño</span>
                    <span className="text-brand-magenta">*Requerido</span>
                  </label>
                  <select 
                    required
                    className="p-3.5 bg-white border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-brand-dark shadow-sm"
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
              )}

              {/* Opciones de Personalización */}
              {options.length > 0 && (
                <div className="space-y-5 p-5 bg-white rounded-2xl shadow-sm border border-brand-pink/20">
                  <h3 className="font-display font-bold text-lg text-brand-dark border-b border-brand-pink/20 pb-3 mb-4">
                    Personalización
                  </h3>
                  
                  {options.map((opt, i) => {
                    if (opt.type === 'text') {
                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-brand-dark">
                            {opt.optionName} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                          </label>
                          <textarea 
                            rows="2"
                            required
                            className="p-3 bg-brand-light/20 border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark resize-none"
                            placeholder="Escribe aquí los detalles..."
                            value={customValues[opt.optionName] || ''}
                            onChange={(e) => handleCustomChange(opt.optionName, e.target.value)}
                          />
                        </div>
                      );
                    }

                    const choices = opt.choices ? opt.choices.split(',').map(c => capitalize(c.trim())).sort() : [];
                    const hasExtraCost = opt.extraCost > 0;

                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-brand-dark">
                          {opt.optionName} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                        </label>
                        <select 
                          required
                          className="p-3 bg-brand-light/20 border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark"
                          value={customValues[opt.optionName] || (hasExtraCost ? 'Ninguno / Sin agregados' : '')}
                          onChange={(e) => handleCustomChange(opt.optionName, e.target.value)}
                        >
                          {!hasExtraCost && <option value="" disabled>Seleccionar...</option>}
                          {hasExtraCost && <option value="Ninguno / Sin agregados">Ninguno / Sin agregados (+$0)</option>}
                          {choices.map((c, j) => (
                            <option key={j} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selector de cantidad y Agregar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-auto">
              {/* Input Quantity */}
              <div className="flex items-center justify-between sm:justify-center px-4 py-3 bg-white border border-brand-pink/50 rounded-xl shadow-sm sm:w-1/3">
                <button 
                  type="button"
                  onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                  disabled={quantity <= 1}
                  className={`p-1 rounded-full transition-colors ${quantity <= 1 ? 'text-gray-300' : 'text-brand-dark hover:text-brand-magenta'}`}
                >
                  <Minus size={20} weight="bold" />
                </button>
                <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-1 rounded-full text-brand-dark hover:text-brand-magenta transition-colors"
                >
                  <Plus size={20} weight="bold" />
                </button>
              </div>

              {/* Add Button */}
              <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center gap-2">
                <ShoppingCart size={20} weight="bold" />
                Añadir al Carrito
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};
