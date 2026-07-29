import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Plus, Trash, Image as ImageIcon, CheckCircle, XCircle, CaretDown, CaretUp, Info, Package, ListBullets, TextT, ImageSquare, TreeStructure, PuzzlePiece } from '@phosphor-icons/react';
import { compressImageToWebP } from '../../utils/imageCompressor';

export const CustomizationBuilder = ({ options = [], onChange, accessories = [], adminHash }) => {
  const [uploadingKey, setUploadingKey] = useState(null);
  const [newlyAddedKey, setNewlyAddedKey] = useState(null);

  // Helper para generar claves únicas de Sanity
  const generateKey = () => Math.random().toString(36).substring(2, 9);

  useEffect(() => {
    if (newlyAddedKey) {
      const el = document.getElementById(`custom-option-card-${newlyAddedKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setNewlyAddedKey(null);
    }
  }, [newlyAddedKey, options]);

  const handleAddOption = () => {
    const newKey = generateKey();
    const newOption = {
      _key: newKey,
      optionName: 'Nueva Selección',
      type: 'list',
      choices: '',
      listOptions: [],
      nestedOptions: [],
      accessoryReference: null,
      extraCost: 0
    };
    onChange([...options, newOption]);
    setNewlyAddedKey(newKey);
  };

  const handleMoveOption = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= options.length) return;
    const updated = [...options];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onChange(updated);
  };

  const handleUpdateOption = (index, field, value) => {
    const updated = options.map((opt, idx) => {
      if (idx === index) {
        return { ...opt, [field]: value };
      }
      return opt;
    });
    onChange(updated);
  };

  const handleRemoveOption = (indexToRemove) => {
    onChange(options.filter((_, idx) => idx !== indexToRemove));
  };

  // Subida de imagen genérica
  const handleUploadImage = async (file, onSuccess) => {
    if (!file) return;
    try {
      const compressed = await compressImageToWebP(file, 600, 0.8);
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
        body: JSON.stringify(compressed)
      });
      if (res.ok) {
        const { asset } = await res.json();
        const imageRef = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id }
        };
        // Opcional: guardamos imageUrl en la sesión actual para previsualizar al momento
        onSuccess(imageRef, compressed.base64);
      } else {
        alert("Error al subir la imagen a Sanity");
      }
    } catch (error) {
      alert("Error de red al intentar subir imagen");
      console.error(error);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'text': return <TextT size={20} className="text-blue-500" />;
      case 'list': return <ListBullets size={20} className="text-green-500" />;
      case 'listImages': return <ImageSquare size={20} className="text-purple-500" />;
      case 'nested': return <TreeStructure size={20} className="text-orange-500" />;
      case 'accessory': return <PuzzlePiece size={20} className="text-brand-magenta" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-brand-pink/20 pb-4">
        <div>
          <h4 className="font-bold text-lg text-brand-dark flex items-center gap-2">
            ✨ Variables y Opciones de Personalización
          </h4>
          <p className="text-xs text-brand-dark/60">
            Configura los desplegables, cuadros de texto y fotos que el cliente deberá elegir en este producto.
          </p>
        </div>
        <Button onClick={handleAddOption} variant="outline" size="sm" className="flex items-center gap-2">
          <Plus weight="bold" /> Añadir Variable
        </Button>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-10 bg-brand-light/20 rounded-2xl border border-dashed border-brand-pink/50">
          <p className="text-sm font-medium text-brand-dark/60 mb-2">Este producto aún no tiene variables de personalización configuradas.</p>
          <p className="text-xs text-brand-dark/40">Haz clic en "Añadir Variable" para permitir que los clientes elijan colores, frases o accesorios.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {options.map((opt, idx) => (
            <div key={opt._key || idx} id={`custom-option-card-${opt._key || idx}`} className="bg-white p-5 rounded-2xl border border-brand-pink/40 shadow-sm transition-all hover:border-brand-pink">
              
              {/* Encabezado de la Variable */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-4 pb-4 border-b border-brand-pink/20 mb-4">
                <div className="flex-grow">
                  <label className="block text-[10px] font-bold text-brand-dark/50 uppercase mb-1">Nombre de la Variable / Pregunta</label>
                  <input 
                    type="text"
                    value={opt.optionName || ''}
                    onChange={(e) => handleUpdateOption(idx, 'optionName', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-pink/40 font-bold text-brand-dark focus:outline-none focus:border-brand-magenta"
                    placeholder="Ej. Elige tu Color, Escribe tu Inicial..."
                  />
                </div>

                <div className="w-full md:w-64">
                  <label className="block text-[10px] font-bold text-brand-dark/50 uppercase mb-1">Tipo de Entrada</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 pointer-events-none">
                      {getTypeIcon(opt.type)}
                    </div>
                    <select 
                      value={opt.type || 'list'}
                      onChange={(e) => handleUpdateOption(idx, 'type', e.target.value)}
                      className="w-full pl-10 p-2.5 rounded-xl border border-brand-pink/40 text-sm font-medium text-brand-dark focus:outline-none focus:border-brand-magenta bg-brand-light/10"
                    >
                      <option value="text">Texto Libre (Input para escribir)</option>
                      <option value="list">Lista Simple (Menú desplegable)</option>
                      <option value="listImages">Lista con Fotos (Muestra visual)</option>
                      <option value="nested">Menú Anidado (Depende de otra opción)</option>
                      <option value="accessory">Accesorio del Stock (Conectado)</option>
                    </select>
                  </div>
                </div>

                <div className="w-32">
                  <label className="block text-[10px] font-bold text-brand-dark/50 uppercase mb-1">Costo Extra ($)</label>
                  <input 
                    type="number"
                    value={opt.extraCost || 0}
                    onChange={(e) => handleUpdateOption(idx, 'extraCost', Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-pink/40 text-sm font-bold text-brand-dark focus:outline-none focus:border-brand-magenta"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-1 mt-4 md:mt-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => handleMoveOption(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-2.5 text-brand-dark/70 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 rounded-xl transition-colors"
                    title="Subir variable"
                  >
                    <CaretUp size={20} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOption(idx, idx + 1)}
                    disabled={idx === options.length - 1}
                    className="p-2.5 text-brand-dark/70 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 rounded-xl transition-colors"
                    title="Bajar variable"
                  >
                    <CaretDown size={20} weight="bold" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors ml-1"
                    title="Eliminar Variable"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>

              {/* Contenido según el Tipo de Entrada */}
              <div className="mt-4">
                
                {/* 1. TEXTO LIBRE */}
                {opt.type === 'text' && (
                  <div className="flex items-center gap-3 bg-blue-50/70 text-blue-800 p-4 rounded-xl border border-blue-100 text-xs">
                    <Info size={24} className="text-blue-500 shrink-0" />
                    <div>
                      <p className="font-bold">Modo Texto Libre</p>
                      <p className="text-blue-700/80">El comprador verá un cuadro de texto en el carrito para redactar su pedido personalizado (nombres, frases dedicadas, fechas, etc.). No se requieren más configuraciones.</p>
                    </div>
                  </div>
                )}

                {/* 2. LISTA SIMPLE */}
                {opt.type === 'list' && (
                  <div className="bg-brand-light/10 p-4 rounded-xl border border-brand-pink/20">
                    <label className="block text-xs font-bold text-brand-dark mb-1">
                      Opciones disponibles para el cliente (Separadas por comas)
                    </label>
                    <input 
                      type="text"
                      value={opt.choices || ''}
                      onChange={(e) => handleUpdateOption(idx, 'choices', e.target.value)}
                      className="w-full p-3 rounded-xl border border-brand-pink/40 text-sm focus:outline-none focus:border-brand-magenta font-mono"
                      placeholder="Ej: Rojo, Azul, Verde, Rosa brillante"
                    />
                    <p className="text-[11px] text-brand-dark/50 mt-1">
                      Escribe los nombres de los ítems separados por una coma y un espacio. Cada elemento aparecerá en la tienda como una opción seleccionable.
                    </p>
                  </div>
                )}

                {/* 3. LISTA CON FOTOS */}
                {opt.type === 'listImages' && (
                  <div className="space-y-3 bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-dark">Ítems Visuales con Foto</span>
                      <Button 
                        type="button"
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          const currentList = opt.listOptions || [];
                          handleUpdateOption(idx, 'listOptions', [...currentList, { _key: generateKey(), value: 'Nuevo ítem', image: null }]);
                        }}
                      >
                        + Añadir Ítem con Foto
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {(opt.listOptions || []).map((subItem, subIdx) => {
                        const uploadKey = `img-${idx}-${subIdx}`;
                        return (
                          <div key={subItem._key || subIdx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-brand-pink/30 shadow-sm">
                            <div className="w-12 h-12 rounded-lg bg-brand-light/20 flex items-center justify-center border overflow-hidden relative shrink-0">
                              {subItem.imageUrl ? (
                                <img src={subItem.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : subItem.image?.asset ? (
                                <CheckCircle size={24} className="text-green-500" />
                              ) : (
                                <ImageIcon size={24} className="text-brand-dark/30" />
                              )}
                            </div>

                            <div className="flex-grow">
                              <input 
                                type="text"
                                value={subItem.value || ''}
                                onChange={(e) => {
                                  const updatedSub = [...opt.listOptions];
                                  updatedSub[subIdx] = { ...updatedSub[subIdx], value: e.target.value };
                                  handleUpdateOption(idx, 'listOptions', updatedSub);
                                }}
                                className="w-full p-2 text-xs font-bold rounded-lg border border-brand-pink/30 focus:outline-none focus:border-brand-magenta"
                                placeholder="Nombre de la muestra..."
                              />
                              <label className="text-[10px] text-brand-magenta hover:underline cursor-pointer flex items-center gap-1 mt-1 font-medium">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden"
                                  disabled={uploadingKey === uploadingKey && uploadingKey === subItem._key_up}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    setUploadingKey(subItem._key);
                                    handleUploadImage(file, (imageRef, previewUrl) => {
                                      const updatedSub = [...opt.listOptions];
                                      updatedSub[subIdx] = { ...updatedSub[subIdx], image: imageRef, imageUrl: previewUrl };
                                      handleUpdateOption(idx, 'listOptions', updatedSub);
                                      setUploadingKey(null);
                                    });
                                  }}
                                />
                                📸 {uploadingKey === subItem._key ? 'Subiendo...' : 'Cambiar Foto (WebP)'}
                              </label>
                            </div>

                            <button
                              onClick={() => {
                                const updatedSub = opt.listOptions.filter((_, i) => i !== subIdx);
                                handleUpdateOption(idx, 'listOptions', updatedSub);
                              }}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <XCircle size={20} weight="fill" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. DROPDOWN ANIDADO / DOBLE SELECCIÓN */}
                {opt.type === 'nested' && (
                  <div className="space-y-4 bg-orange-50/40 p-4 rounded-2xl border border-orange-200/60">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">
                        Nombre del Menú Secundario (Dependiente)
                      </label>
                      <input 
                        type="text"
                        value={opt.childOptionName || ''}
                        onChange={(e) => handleUpdateOption(idx, 'childOptionName', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-orange-300 text-xs font-medium focus:outline-none focus:border-orange-500 bg-white"
                        placeholder="Ej. Si la principal es 'Forma del Dije', la secundaria podría ser 'Color del Dije'"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold text-orange-900">Grupos de Dependencia</span>
                      <Button 
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newKey = generateKey();
                          const currentNested = opt.nestedOptions || [];
                          handleUpdateOption(idx, 'nestedOptions', [...currentNested, { _key: newKey, parentChoice: 'Ej: Forma Corazón', childChoices: [] }]);
                          setTimeout(() => {
                            const el = document.getElementById(`nested-group-${newKey}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                      >
                        + Añadir Grupo Padre-Hijo
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {(opt.nestedOptions || []).map((grp, grpIdx) => (
                        <div key={grp._key || grpIdx} id={`nested-group-${grp._key || grpIdx}`} className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                            <span className="text-xs font-bold text-orange-600 uppercase">Cuando el cliente elija:</span>
                            <input 
                              type="text"
                              value={grp.parentChoice || ''}
                              onChange={(e) => {
                                const newGrp = [...opt.nestedOptions];
                                newGrp[grpIdx] = { ...newGrp[grpIdx], parentChoice: e.target.value };
                                handleUpdateOption(idx, 'nestedOptions', newGrp);
                              }}
                              className="flex-grow p-1.5 text-xs font-bold border-b border-orange-400 focus:outline-none"
                              placeholder="Nombre de la opción primaria..."
                            />
                            <button 
                              onClick={() => {
                                const newGrp = opt.nestedOptions.filter((_, i) => i !== grpIdx);
                                handleUpdateOption(idx, 'nestedOptions', newGrp);
                              }}
                              className="text-red-400 hover:text-red-600 ml-2"
                            >
                              <Trash size={16} />
                            </button>
                          </div>

                          <div className="pl-4 border-l-2 border-orange-200 space-y-3">
                            <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-200/60">
                              <label className="block text-[11px] font-bold text-orange-900 mb-1.5">
                                🔗 Origen de datos para la lista hija:
                              </label>
                              <select 
                                value={grp.accessoryReference?._ref || grp.accessoryRefId || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const refObj = val ? { _type: 'reference', _ref: val } : null;
                                  const newGrp = [...opt.nestedOptions];
                                  newGrp[grpIdx] = { ...newGrp[grpIdx], accessoryReference: refObj };
                                  
                                  let newOpt = { ...opt, nestedOptions: newGrp };
                                  if (val && (!newOpt.childOptionName || newOpt.childOptionName.trim() === '')) {
                                    const matchedAcc = accessories.find(a => a._id === val);
                                    if (matchedAcc) {
                                      newOpt.childOptionName = matchedAcc.name;
                                    }
                                  }
                                  
                                  const updated = options.map((o, i) => i === idx ? newOpt : o);
                                  onChange(updated);
                                }}
                                className="w-full p-2 rounded-lg border border-orange-300 text-xs font-semibold bg-white focus:outline-none focus:border-orange-500 text-brand-dark"
                              >
                                <option value="">✏️ Carga Manual (Añadir sub-opciones a mano)</option>
                                {accessories.filter(acc => !acc.isArchived).map(acc => (
                                  <option key={acc._id} value={acc._id}>
                                    📦 Tabla de Accesorios: {acc.name} ({acc.stockType === 'finite' ? 'Stock contable' : 'Infinito'})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {(grp.accessoryReference?._ref || grp.accessoryRefId) ? (() => {
                              const selectedId = grp.accessoryReference?._ref || grp.accessoryRefId;
                              const matchedAcc = accessories.find(a => a._id === selectedId);
                              if (!matchedAcc) return null;
                              return (
                                <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs">
                                  <p className="font-bold text-orange-700 mb-1">✅ Accesorio vinculado: {matchedAcc.name}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {matchedAcc.options?.map((subOpt, sIdx) => (
                                      <span key={subOpt._key || sIdx} className="bg-orange-50 px-2 py-0.5 rounded text-[10px] text-orange-900 border border-orange-200 font-medium">
                                        {subOpt.value} {matchedAcc.stockType === 'finite' ? `(Stock: ${subOpt.stockCount || 0})` : ''}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-[10px] text-orange-700/70 mt-2 italic">
                                    Nota: Cuando el cliente elija "{grp.parentChoice}", este menú secundario mostrará automáticamente las opciones de esta tabla con su stock en tiempo real.
                                  </p>
                                </div>
                              );
                            })() : (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-medium text-gray-500">Mostrar las siguientes opciones secundarias:</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newGrp = [...opt.nestedOptions];
                                      const currentChildren = newGrp[grpIdx].childChoices || [];
                                      newGrp[grpIdx].childChoices = [...currentChildren, { _key: generateKey(), value: 'Nueva variante', image: null }];
                                      handleUpdateOption(idx, 'nestedOptions', newGrp);
                                    }}
                                    className="text-[11px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded hover:bg-orange-200"
                                  >
                                    + Sub-opción
                                  </button>
                                </div>

                                {(grp.childChoices || []).map((child, chIdx) => (
                                  <div key={child._key || chIdx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-xs">
                                    <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
                                    <input 
                                      type="text"
                                      value={child.value || ''}
                                      onChange={(e) => {
                                        const newGrp = [...opt.nestedOptions];
                                        newGrp[grpIdx].childChoices[chIdx] = { ...newGrp[grpIdx].childChoices[chIdx], value: e.target.value };
                                        handleUpdateOption(idx, 'nestedOptions', newGrp);
                                      }}
                                      className="flex-grow p-1 rounded border border-gray-300 bg-white"
                                      placeholder="Variante (Ej: Rojo, Oro...)"
                                    />

                                    {child.imageUrl ? (
                                      <img src={child.imageUrl} alt="" className="w-7 h-7 rounded object-cover border" />
                                    ) : child.image?.asset && (
                                      <CheckCircle size={18} className="text-green-500" />
                                    )}

                                    <label className="cursor-pointer bg-white px-2 py-1 rounded border border-gray-300 text-[10px] font-bold hover:bg-gray-100">
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          handleUploadImage(file, (imageRef, previewUrl) => {
                                            const newGrp = [...opt.nestedOptions];
                                            newGrp[grpIdx].childChoices[chIdx] = { 
                                              ...newGrp[grpIdx].childChoices[chIdx], 
                                              image: imageRef,
                                              imageUrl: previewUrl 
                                            };
                                            handleUpdateOption(idx, 'nestedOptions', newGrp);
                                          });
                                        }}
                                      />
                                      📷 Foto
                                    </label>

                                    <button
                                      onClick={() => {
                                        const newGrp = [...opt.nestedOptions];
                                        newGrp[grpIdx].childChoices = newGrp[grpIdx].childChoices.filter((_, i) => i !== chIdx);
                                        handleUpdateOption(idx, 'nestedOptions', newGrp);
                                      }}
                                      className="text-red-400 hover:text-red-600 ml-1"
                                    >
                                      <XCircle size={16} weight="fill" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. ACCESORIO DE STOCK */}
                {opt.type === 'accessory' && (
                  <div className="bg-brand-light/20 p-4 rounded-xl border border-brand-pink/30">
                    <label className="block text-xs font-bold text-brand-dark mb-2">
                      Conectar con Grupo de Accesorios de nuestro Inventario
                    </label>
                    <select 
                      value={opt.accessoryReference?._ref || opt.accessoryRefId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const refObj = val ? { _type: 'reference', _ref: val } : null;
                        handleUpdateOption(idx, 'accessoryReference', refObj);
                      }}
                      className="w-full p-3 rounded-xl border border-brand-pink/50 text-sm font-bold bg-white focus:outline-none focus:border-brand-magenta text-brand-dark"
                    >
                      <option value="">-- Selecciona una tabla de accesorios existente --</option>
                      {accessories.filter(acc => !acc.isArchived).map(acc => (
                        <option key={acc._id} value={acc._id}>
                          📦 {acc.name} ({acc.stockType === 'finite' ? 'Stock contable' : 'Infinito'}) • {acc.options?.length || 0} variantes disponibles
                        </option>
                      ))}
                    </select>

                    {/* Previsualización del accesorio seleccionado */}
                    {(() => {
                      const selectedId = opt.accessoryReference?._ref || opt.accessoryRefId;
                      const matchedAcc = accessories.find(a => a._id === selectedId);
                      if (!matchedAcc) return null;
                      return (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-brand-pink/20 text-xs">
                          <p className="font-bold text-brand-magenta mb-1">✅ Accesorio vinculado: {matchedAcc.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {matchedAcc.options?.map((subOpt, sIdx) => (
                              <span key={subOpt._key || sIdx} className="bg-brand-light/50 px-2 py-0.5 rounded text-[10px] text-brand-dark border border-brand-pink/20 font-medium">
                                {subOpt.value} {matchedAcc.stockType === 'finite' ? `(Stock: ${subOpt.stockCount || 0})` : ''}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-brand-dark/50 mt-2 italic">
                            Nota: El stock se descontará automáticamente de la tabla de accesorios cuando un cliente realice un pedido. No necesitas duplicar fotos ni datos aquí.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
