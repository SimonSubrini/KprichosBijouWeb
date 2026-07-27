import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../lib/sanity';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from '../components/ui/Button';
import { CustomDropdown } from '../components/ui/CustomDropdown';
import { ShoppingCart, CaretLeft, CaretRight, Minus, Plus, ArrowLeft, WarningCircle, HandPalm } from '@phosphor-icons/react';
import { PortableText } from '@portabletext/react';

const toCapitalCase = (str) => {
  if (!str) return '';
  return String(str)
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const capitalize = toCapitalCase;

export const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for customization
  const [customValues, setCustomValues] = useState({});
  const [selectedModel, setSelectedModel] = useState('');
  const [modelOverrideImage, setModelOverrideImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const addItem = useCartStore((state) => state.addItem);
  const { customOrdersSuspended, suspensionMessage } = useSettingsStore();

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
    setModelOverrideImage(null);
    if (product.imageUrls) {
      setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
    }
  };

  const prevImage = () => {
    setModelOverrideImage(null);
    if (product.imageUrls) {
      setCurrentImageIndex((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
    }
  };

  const handleCustomChange = (optionName, val) => {
    setCustomValues(prev => ({ ...prev, [optionName]: val }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (product.type === 'custom' && customOrdersSuspended) {
      alert(suspensionMessage || "De momento no se están tomando pedidos personalizados. ¡Gracias por la comprensión!");
      return;
    }

    // Validar modelo si es obligatorio
    if (product.hasModels && !selectedModel) {
      alert("Por favor, selecciona un modelo/tamaño.");
      return;
    }

    const options = product.customizationOptions || [];

    // Validar opciones custom obligatorias
    for (const opt of options) {
      const hasExtraCost = opt.extraCost > 0;
      if (opt.type === 'text') {
        continue;
      }

      const val = customValues[opt.optionName] || (hasExtraCost ? 'Ninguno / Sin agregados' : '');
      
      if (!val) {
        alert(`Por favor, completa la opción: ${opt.optionName}`);
        return;
      }
      
      if (opt.type === 'nested') {
        const childVal = customValues[opt.childOptionName];
        if (val !== 'Ninguno / Sin agregados' && !childVal) {
          alert(`Por favor, completa la opción: ${opt.childOptionName}`);
          return;
        }
      }
    }

    let totalExtraCost = 0;
    const accessorySelections = [];
    
    // Parse custom values
    let customizationsString = Object.entries(customValues)
      .map(([key, value]) => {
        if (key.startsWith('__toggle_')) return null;
        if (!value || value === 'Ninguno / Sin agregados') return null;
        if (typeof value === 'string' && !value.trim()) return null;
        
        const optionDef = options.find(opt => opt.optionName === key);
        if (optionDef && optionDef.extraCost) {
          totalExtraCost += optionDef.extraCost;
        }

        if (optionDef && optionDef.type === 'accessory' && optionDef.accessoryReference) {
          const accOpt = optionDef.accessoryReference.options?.find(o => toCapitalCase(o.value) === toCapitalCase(value.trim()) || o.value === value.trim());
          if (accOpt) {
            accessorySelections.push({
              accessoryId: optionDef.accessoryReference._id,
              optionValue: accOpt.value,
              optionKey: accOpt._key,
              stockCount: accOpt.stockCount,
              stockType: optionDef.accessoryReference.stockType
            });
          }
        }

        // Soporte de stock para menús anidados vinculados a tabla de accesorios
        const parentNestedDef = options.find(opt => opt.type === 'nested' && opt.childOptionName === key);
        if (parentNestedDef && parentNestedDef.nestedOptions) {
          const selectedParent = customValues[parentNestedDef.optionName];
          const activeGroup = parentNestedDef.nestedOptions.find(n => toCapitalCase(n.parentChoice) === toCapitalCase(selectedParent) || n.parentChoice === selectedParent);
          if (activeGroup && activeGroup.accessoryReference) {
            const accOpt = activeGroup.accessoryReference.options?.find(o => toCapitalCase(o.value) === toCapitalCase(value.trim()) || o.value === value.trim());
            if (accOpt) {
              accessorySelections.push({
                accessoryId: activeGroup.accessoryReference._id,
                optionValue: accOpt.value,
                optionKey: accOpt._key,
                stockCount: accOpt.stockCount,
                stockType: activeGroup.accessoryReference.stockType
              });
            }
          }
        }

        if (optionDef && optionDef.extraCost) {
          return `${key}: ${value.trim()} (+ $${optionDef.extraCost})`;
        }
        return `${key}: ${typeof value === 'string' ? value.trim() : value}`;
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

    let maxAllowed = Infinity;
    if (product.type === 'stock') {
      if (product.hasModels && selectedModel) {
        maxAllowed = product.models.find(m => m.name === selectedModel)?.stockCount || Infinity;
      } else {
        maxAllowed = product.stockCount;
      }
    }
    accessorySelections.forEach(acc => {
      if (acc.stockType === 'finite') {
        maxAllowed = Math.min(maxAllowed, acc.stockCount);
      }
    });

    const customizedProduct = {
      ...product,
      basePrice: finalPrice + totalExtraCost,
      accessorySelections,
      maxAllowed,
      imageUrls: modelOverrideImage ? [modelOverrideImage, ...(product.imageUrls || [])] : product.imageUrls
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

  let currentMaxAllowed = Infinity;
  if (product.type === 'stock') {
    if (product.hasModels && selectedModel) {
      currentMaxAllowed = product.models.find(m => m.name === selectedModel)?.stockCount || Infinity;
    } else {
      currentMaxAllowed = product.stockCount;
    }
  }
  options.forEach(opt => {
    if (opt.type === 'accessory' && opt.accessoryReference) {
      const val = customValues[opt.optionName];
      if (val && val !== 'Ninguno / Sin agregados') {
        const accOpt = opt.accessoryReference.options?.find(o => o.value === val);
        if (accOpt && opt.accessoryReference.stockType === 'finite') {
          currentMaxAllowed = Math.min(currentMaxAllowed, accOpt.stockCount);
        }
      }
    }
  });

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
            {(modelOverrideImage || (product.imageUrls && product.imageUrls.length > 0)) ? (
              <>
                <img 
                  src={`${modelOverrideImage || product.imageUrls[currentImageIndex]}?w=1200&auto=format&fit=max`} 
                  alt={product.name} 
                  className="object-cover w-full h-full transition-all duration-300" 
                />
                
                {product.imageUrls && product.imageUrls.length > 1 && (
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
                          onClick={() => {
                            setModelOverrideImage(null);
                            setCurrentImageIndex(idx);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-colors shadow-sm ${(!modelOverrideImage && idx === currentImageIndex) ? 'bg-brand-magenta' : 'bg-white/70 hover:bg-white'}`}
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

          {product.type === 'custom' && customOrdersSuspended && (
            <div className="bg-brand-light/50 border-2 border-brand-pink/60 rounded-3xl p-5 mb-6 text-brand-dark shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 font-display font-bold text-lg text-brand-magenta mb-2">
                <WarningCircle size={28} weight="fill" className="text-brand-magenta flex-shrink-0" />
                <span>Pedidos Personalizados Temporalmente Suspendidos</span>
              </div>
              <p className="text-sm md:text-base text-brand-dark/80 leading-relaxed sm:pl-10">
                {suspensionMessage || 'De momento no se están tomando pedidos personalizados debido a saturación temporal en nuestro taller artesanal.'}
              </p>
            </div>
          )}

          {/* Renderizado de Descripción Larga (Sanity Portable Text / String) */}
          {product.longDescription && (
            <div className="prose prose-sm lg:prose-base prose-pink text-brand-dark/80 mb-8 max-w-none">
              {typeof product.longDescription === 'string' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{product.longDescription}</p>
              ) : (
                <PortableText value={product.longDescription} />
              )}
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
                    className="p-3.5 bg-white border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-brand-dark shadow-sm"
                    value={selectedModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedModel(val);
                      setQuantity(1); // Reset quantity when changing model
                      const chosenModel = product.models.find(m => m.name === val);
                      if (chosenModel?.imageUrl) {
                        setModelOverrideImage(chosenModel.imageUrl);
                      } else {
                        setModelOverrideImage(null);
                      }
                    }}
                  >
                    <option value="" disabled>Selecciona un modelo</option>
                    {product.models.map((m, idx) => {
                      const isOutOfStock = product.type === 'stock' && m.stockCount <= 0;
                      return (
                        <option key={idx} value={m.name} disabled={isOutOfStock}>
                          {m.name} - ${m.price} {isOutOfStock ? '(Sin stock)' : ''}
                        </option>
                      );
                    })}
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
                      const hasExtraCost = opt.extraCost > 0;
                      const toggleKey = `__toggle_${opt.optionName}`;
                      const isToggled = customValues[toggleKey] ?? false;

                      if (hasExtraCost) {
                        return (
                          <div key={i} className="flex flex-col gap-3 p-4 bg-brand-light/30 border border-brand-pink/30 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-brand-dark">
                                ¿Añadir {toCapitalCase(opt.optionName)}? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span>
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  checked={isToggled}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    handleCustomChange(toggleKey, checked);
                                    if (!checked) {
                                      handleCustomChange(opt.optionName, '');
                                    }
                                  }}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-magenta"></div>
                              </label>
                            </div>
                            {isToggled && (
                              <div className="flex flex-col gap-1.5 mt-1 animate-fade-in">
                                <label className="text-xs font-medium text-brand-dark/70">
                                  Detalles para {toCapitalCase(opt.optionName)}:
                                </label>
                                <textarea 
                                  rows="2"
                                  className="p-3 bg-white border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark resize-none"
                                  placeholder="Escribe aquí los detalles..."
                                  value={customValues[opt.optionName] || ''}
                                  onChange={(e) => handleCustomChange(opt.optionName, e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-brand-dark">
                            {toCapitalCase(opt.optionName)}
                          </label>
                          <textarea 
                            rows="2"
                            className="p-3 bg-brand-light/20 border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark resize-none"
                            placeholder="Escribe aquí los detalles..."
                            value={customValues[opt.optionName] || ''}
                            onChange={(e) => handleCustomChange(opt.optionName, e.target.value)}
                          />
                        </div>
                      );
                    }
                    
                    if (opt.type === 'listImages') {
                      const hasExtraCost = opt.extraCost > 0;
                      const optionsArr = [];
                      if (!hasExtraCost) optionsArr.push({ value: '', label: 'Seleccionar...' });
                      if (hasExtraCost) optionsArr.push({ value: 'Ninguno / Sin agregados', label: `Ninguno / Sin agregados (+$0)` });
                      
                      const sortedList = [...(opt.listOptions || [])].sort((a, b) => a.value.localeCompare(b.value, 'es'));
                      sortedList.forEach(lo => {
                        const capVal = toCapitalCase(lo.value);
                        optionsArr.push({
                          value: capVal,
                          label: capVal,
                          image: lo.imageUrl
                        });
                      });

                      const selectedVal = customValues[opt.optionName] || (hasExtraCost ? 'Ninguno / Sin agregados' : '');

                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-brand-dark">
                            {toCapitalCase(opt.optionName)} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                          </label>
                          <CustomDropdown 
                            options={optionsArr}
                            value={selectedVal}
                            onChange={(val) => handleCustomChange(opt.optionName, val)}
                            placeholder="Seleccionar..."
                          />
                        </div>
                      );
                    }

                    if (opt.type === 'nested') {
                      const hasExtraCost = opt.extraCost > 0;
                      const parentChoices = opt.nestedOptions ? opt.nestedOptions.map(n => toCapitalCase(n.parentChoice)).sort((a, b) => a.localeCompare(b, 'es')) : [];
                      
                      const parentOptions = [];
                      if (!hasExtraCost) parentOptions.push({ value: '', label: 'Seleccionar...' });
                      if (hasExtraCost) parentOptions.push({ value: 'Ninguno / Sin agregados', label: `Ninguno / Sin agregados (+$0)` });
                      parentChoices.forEach(c => parentOptions.push({ value: c, label: c }));

                      const selectedParent = customValues[opt.optionName] || (hasExtraCost ? 'Ninguno / Sin agregados' : '');
                      
                      const activeNestedGroup = opt.nestedOptions?.find(n => toCapitalCase(n.parentChoice) === toCapitalCase(selectedParent) || n.parentChoice === selectedParent);
                      
                      let childOptions = [];
                      if (activeNestedGroup && activeNestedGroup.accessoryReference) {
                        const accGroup = activeNestedGroup.accessoryReference;
                        const isFinite = accGroup.stockType === 'finite';
                        const sortedAccs = [...(accGroup.options || [])].sort((a, b) => a.value.localeCompare(b.value, 'es'));
                        childOptions = sortedAccs.map(lo => {
                          const outOfStock = isFinite ? lo.stockCount <= 0 : !lo.isAvailable;
                          const capVal = toCapitalCase(lo.value);
                          return {
                            value: capVal,
                            label: capVal + (outOfStock ? ' (Sin stock)' : ''),
                            image: lo.imageUrl,
                            disabled: outOfStock
                          };
                        });
                      } else {
                        const childChoices = [...(activeNestedGroup?.childChoices || [])].sort((a, b) => a.value.localeCompare(b.value, 'es'));
                        childOptions = childChoices.map(c => {
                          const capVal = toCapitalCase(c.value);
                          return {
                            value: capVal,
                            label: capVal,
                            image: c.imageUrl
                          };
                        });
                      }

                      const showChild = selectedParent && selectedParent !== 'Ninguno / Sin agregados' && childOptions.length > 0;

                      return (
                        <div key={i} className="flex flex-col gap-4 p-5 bg-brand-light/30 border border-brand-pink/30 rounded-2xl">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-brand-dark">
                              {toCapitalCase(opt.optionName)} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                            </label>
                            <CustomDropdown 
                              options={parentOptions}
                              value={selectedParent}
                              onChange={(val) => {
                                handleCustomChange(opt.optionName, val);
                                handleCustomChange(opt.childOptionName, '');
                              }}
                              placeholder="Seleccionar..."
                            />
                          </div>

                          {showChild && (
                            <div className="flex flex-col gap-2 animate-fade-in pl-4 border-l-2 border-brand-pink/40 mt-1">
                              <label className="text-sm font-semibold text-brand-dark">
                                {toCapitalCase(opt.childOptionName)}
                              </label>
                              <CustomDropdown 
                                options={[{value: '', label: 'Seleccionar...'}, ...childOptions]}
                                value={customValues[opt.childOptionName] || ''}
                                onChange={(val) => {
                                  handleCustomChange(opt.childOptionName, val);
                                  if (activeNestedGroup?.accessoryReference) {
                                    setQuantity(1);
                                  }
                                }}
                                placeholder="Seleccionar..."
                              />
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (opt.type === 'accessory' && opt.accessoryReference) {
                      const hasExtraCost = opt.extraCost > 0;
                      const accGroup = opt.accessoryReference;
                      const isFinite = accGroup.stockType === 'finite';
                      
                      const optionsArr = [];
                      if (!hasExtraCost) optionsArr.push({ value: '', label: 'Seleccionar...' });
                      if (hasExtraCost) optionsArr.push({ value: 'Ninguno / Sin agregados', label: `Ninguno / Sin agregados (+$0)` });
                      
                      const sortedAcc = [...(accGroup.options || [])].sort((a, b) => a.value.localeCompare(b.value, 'es'));
                      sortedAcc.forEach(lo => {
                        const outOfStock = isFinite ? lo.stockCount <= 0 : !lo.isAvailable;
                        const capVal = toCapitalCase(lo.value);
                        optionsArr.push({
                          value: capVal,
                          label: capVal + (outOfStock ? ' (Sin stock)' : ''),
                          image: lo.imageUrl,
                          disabled: outOfStock
                        });
                      });

                      const selectedVal = customValues[opt.optionName] || (hasExtraCost ? 'Ninguno / Sin agregados' : '');

                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-brand-dark">
                            {toCapitalCase(opt.optionName)} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                          </label>
                          <CustomDropdown 
                            options={optionsArr}
                            value={selectedVal}
                            onChange={(val) => {
                              handleCustomChange(opt.optionName, val);
                              setQuantity(1); // Reset quantity when changing accessory to avoid exceeding stock
                            }}
                            placeholder="Seleccionar..."
                          />
                        </div>
                      );
                    }

                    const choices = opt.choices ? opt.choices.split(',').map(c => toCapitalCase(c.trim())).sort((a, b) => a.localeCompare(b, 'es')) : [];
                    const hasExtraCost = opt.extraCost > 0;

                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-brand-dark">
                          {toCapitalCase(opt.optionName)} {opt.extraCost ? <span className="text-brand-magenta font-normal">(+${opt.extraCost})</span> : ''}
                        </label>
                        <select 
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
                  disabled={quantity <= 1 || (product.type === 'custom' && customOrdersSuspended)}
                  className={`p-1 rounded-full transition-colors ${quantity <= 1 || (product.type === 'custom' && customOrdersSuspended) ? 'text-gray-300 cursor-not-allowed' : 'text-brand-dark hover:text-brand-magenta'}`}
                >
                  <Minus size={20} weight="bold" />
                </button>
                <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                <button 
                  type="button"
                  disabled={product.type === 'custom' && customOrdersSuspended}
                  onClick={() => {
                    if (quantity < currentMaxAllowed) {
                      setQuantity(q => q + 1);
                    } else {
                      alert("No hay más stock disponible para este producto o uno de sus accesorios.");
                    }
                  }}
                  className={`p-1 rounded-full transition-colors ${product.type === 'custom' && customOrdersSuspended ? 'text-gray-300 cursor-not-allowed' : 'text-brand-dark hover:text-brand-magenta'}`}
                >
                  <Plus size={20} weight="bold" />
                </button>
              </div>

              {/* Add Button */}
              <Button 
                type="submit" 
                variant="primary" 
                disabled={product.type === 'custom' && customOrdersSuspended}
                className={`flex-1 flex items-center justify-center gap-2 ${product.type === 'custom' && customOrdersSuspended ? 'bg-brand-magenta/70 hover:bg-brand-magenta/70 opacity-80 cursor-not-allowed' : ''}`}
              >
                {product.type === 'custom' && customOrdersSuspended ? (
                  <>
                    <HandPalm size={22} weight="fill" />
                    <span>Pedidos Personalizados Suspendidos</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} weight="bold" />
                    <span>Añadir al Carrito</span>
                  </>
                )}
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};
