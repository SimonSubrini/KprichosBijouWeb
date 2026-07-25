import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { EyeSlash, Eye, Plus, PencilSimple, Image as ImageIcon, CheckCircle, XCircle, Tag, CurrencyCircleDollar } from '@phosphor-icons/react';
import { compressImageToWebP } from '../../utils/imageCompressor';
import { CustomizationBuilder } from './CustomizationBuilder';

export const ProductsManager = ({ products = [], accessories = [], adminHash, onRefresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleCreateNew = () => {
    setEditingProduct({
      _id: 'new',
      _type: 'product',
      name: '',
      description: '',
      type: 'stock',
      hasModels: false,
      basePrice: 0,
      stockCount: 0,
      models: [],
      images: [],
      customizationOptions: [],
      isArchived: false
    });
  };

  const handleSave = async (productData) => {
    setIsSubmitting(true);
    try {
      const isNew = productData._id === 'new';
      const bodyData = { ...productData };
      if (isNew) delete bodyData._id;

      const res = await fetch('/api/admin/inventory', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        setEditingProduct(null);
        onRefresh();
      } else {
        alert("Error guardando producto");
      }
    } catch (error) {
      alert("Error de red");
    }
    setIsSubmitting(false);
  };

  const handleArchive = async (_id, isArchived) => {
    if (!confirm(`¿Estás seguro de ${isArchived ? 'archivar' : 'restaurar'} este producto?`)) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
        body: JSON.stringify({ _id, isArchived })
      });
      onRefresh();
    } catch (error) {}
    setIsSubmitting(false);
  };

  if (editingProduct) {
    return <ProductEditor 
      product={editingProduct} 
      accessories={accessories}
      onSave={handleSave} 
      onCancel={() => setEditingProduct(null)} 
      isSubmitting={isSubmitting}
      adminHash={adminHash}
    />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-brand-dark">Gestión de Productos</h3>
        <Button onClick={handleCreateNew} variant="primary" className="flex items-center gap-2">
          <Plus weight="bold" /> Nuevo Producto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <p className="text-brand-dark/50 col-span-full text-center py-8">No hay productos registrados.</p>
        ) : (
          products.map(product => (
            <div key={product._id} className={`flex flex-col overflow-hidden rounded-2xl border ${product.isArchived ? 'bg-gray-50 border-gray-200' : 'bg-white border-brand-pink/30 shadow-sm'}`}>
              <div className="relative h-40 bg-brand-light/30">
                {product.imageUrls?.[0] ? (
                  <img src={`${product.imageUrls[0]}?w=400&h=300&fit=crop`} alt={product.name} className={`w-full h-full object-cover ${product.isArchived ? 'opacity-50 grayscale' : ''}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-dark/20"><ImageIcon size={48} /></div>
                )}
                {product.isArchived && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="bg-gray-800 text-white font-bold px-3 py-1 rounded-full text-sm">Archivado</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => setEditingProduct(product)} className="p-2 bg-white/90 text-brand-dark hover:text-brand-magenta rounded-lg shadow-sm backdrop-blur-sm transition-colors">
                    <PencilSimple size={18} />
                  </button>
                  <button onClick={() => handleArchive(product._id, !product.isArchived)} className={`p-2 bg-white/90 shadow-sm backdrop-blur-sm rounded-lg transition-colors ${product.isArchived ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.isArchived ? <Eye size={18} /> : <EyeSlash size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex-grow flex flex-col">
                <div className="mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-magenta bg-brand-magenta/10 px-2 py-0.5 rounded-md mr-2">
                    {product.type === 'custom' ? 'A Pedido' : 'Stock'}
                  </span>
                </div>
                <h4 className={`font-display font-bold text-lg mb-1 leading-tight ${product.isArchived ? 'text-gray-500' : 'text-brand-dark'}`}>
                  {product.name}
                </h4>
                <div className="mt-auto pt-3 flex justify-between items-end">
                  <div className="text-sm font-bold text-brand-dark">
                    {product.hasModels ? (
                      <span className="text-brand-dark/70 text-xs">Varios Precios</span>
                    ) : (
                      `$${product.basePrice || 0}`
                    )}
                  </div>
                  <div className="text-xs text-brand-dark/60 font-medium">
                    {product.type === 'stock' ? (
                      product.hasModels ? `${product.models?.length || 0} modelos` : `Stock: ${product.stockCount || 0}`
                    ) : (
                      `${product.customizationOptions?.length || 0} opciones`
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProductEditor = ({ product, accessories = [], onSave, onCancel, isSubmitting, adminHash }) => {
  const [formData, setFormData] = useState({ ...product });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  // --- Manejo de Imágenes ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImage(true);
    const newImages = [];
    
    // Subir secuencialmente para no saturar Vercel
    for (const file of files) {
      try {
        const compressed = await compressImageToWebP(file, 800, 0.8);
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
          body: JSON.stringify(compressed)
        });
        if (res.ok) {
          const { asset } = await res.json();
          newImages.push({
            _key: Math.random().toString(36).substring(7),
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id }
          });
        }
      } catch (error) {
        console.error("Error subiendo imagen:", error);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages]
    }));
    setUploadingImage(false);
  };

  const removeImage = (keyToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img._key !== keyToRemove)
    }));
  };

  // --- Manejo de Modelos ---
  const handleAddModel = () => {
    setFormData(prev => ({
      ...prev,
      models: [...(prev.models || []), { _key: Math.random().toString(36).substring(7), name: 'Nuevo Modelo', price: 0, stockCount: 0 }]
    }));
  };
  
  const updateModel = (key, field, value) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models.map(m => m._key === key ? { ...m, [field]: value } : m)
    }));
  };

  const removeModel = (key) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models.filter(m => m._key !== key)
    }));
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-6 border-b border-brand-pink/20 pb-4">
        <h3 className="text-2xl font-display font-bold text-brand-dark">
          {product._id === 'new' ? 'Crear Producto Nuevo' : 'Editar Producto'}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button variant="primary" onClick={() => onSave(formData)} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-light/10 p-6 rounded-2xl border border-brand-pink/30">
            <h4 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2"><Tag /> Información Básica</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark/70 mb-1">Nombre del Producto</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-brand-pink/40 focus:outline-none focus:border-brand-magenta"
                  placeholder="Ej. Llavero Inicial Resina"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark/70 mb-1">Resumen (Corto)</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleChange} rows={2}
                  className="w-full p-3 rounded-xl border border-brand-pink/40 focus:outline-none focus:border-brand-magenta"
                  placeholder="Se muestra en la tarjeta principal..."
                />
              </div>
            </div>
          </div>

          <div className="bg-brand-light/10 p-6 rounded-2xl border border-brand-pink/30">
            <h4 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2"><CurrencyCircleDollar /> Precio y Stock</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark/70 mb-1">Tipo de Producto</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-3 rounded-xl border border-brand-pink/40">
                  <option value="stock">Stock (Disponibilidad Inmediata)</option>
                  <option value="custom">A Pedido (Personalizado)</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-brand-dark">
                  <input 
                    type="checkbox" name="hasModels" checked={formData.hasModels} onChange={handleChange}
                    className="w-5 h-5 text-brand-magenta focus:ring-brand-magenta rounded border-gray-300"
                  />
                  ¿Tiene múltiples modelos/tamaños?
                </label>
              </div>
            </div>

            {!formData.hasModels ? (
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-brand-pink/20">
                <div>
                  <label className="block text-xs font-bold text-brand-dark/50 uppercase mb-1">Precio Base ($)</label>
                  <input 
                    type="number" name="basePrice" value={formData.basePrice} onChange={handleChange}
                    className="w-full p-2 rounded-lg border border-brand-pink/40"
                  />
                </div>
                {formData.type === 'stock' && (
                  <div>
                    <label className="block text-xs font-bold text-brand-dark/50 uppercase mb-1">Stock Disponible</label>
                    <input 
                      type="number" name="stockCount" value={formData.stockCount} onChange={handleChange}
                      className="w-full p-2 rounded-lg border border-brand-pink/40"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-brand-dark/70">Modelos y Variantes</label>
                  <Button variant="outline" size="sm" onClick={handleAddModel}><Plus/> Añadir Modelo</Button>
                </div>
                {formData.models?.map(model => (
                  <div key={model._key} className="flex gap-2 p-3 bg-white rounded-xl border border-brand-pink/20 items-end relative">
                    <div className="flex-grow">
                      <label className="block text-[10px] font-bold text-brand-dark/50 uppercase">Nombre</label>
                      <input type="text" value={model.name} onChange={(e) => updateModel(model._key, 'name', e.target.value)} className="w-full p-1 border-b border-brand-pink/40 focus:outline-none" />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-brand-dark/50 uppercase">Precio ($)</label>
                      <input type="number" value={model.price} onChange={(e) => updateModel(model._key, 'price', Number(e.target.value))} className="w-full p-1 border-b border-brand-pink/40 focus:outline-none" />
                    </div>
                    <div className="w-20">
                      <label className="block text-[10px] font-bold text-brand-dark/50 uppercase">Stock</label>
                      <input type="number" value={model.stockCount} onChange={(e) => updateModel(model._key, 'stockCount', Number(e.target.value))} className="w-full p-1 border-b border-brand-pink/40 focus:outline-none" />
                    </div>
                    <button onClick={() => removeModel(model._key)} className="text-red-400 hover:text-red-600 mb-1 ml-1"><XCircle size={20} weight="fill"/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Imágenes */}
          <div className="bg-brand-light/10 p-6 rounded-2xl border border-brand-pink/30">
            <h4 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2"><ImageIcon /> Galería de Imágenes</h4>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {formData.images?.map((img, idx) => (
                <div key={img._key || idx} className="relative aspect-square rounded-lg border border-brand-pink/30 overflow-hidden bg-white">
                  {/* Como guardamos solo refs, no podemos previsualizar instantáneamente sin hacer otro fetch, 
                      pero si ya venían del producto original sí las vemos porque el groq original no trajo imageUrl para el editor,
                      ¡Espera! groq fetchProductById trae imageUrls pero no asociadas a las keys, 
                      simplifiquemos: en MVP mostramos "Imagen asignada" si no tenemos URL, 
                      o podemos inferir la url. Para MVP simplemente: */}
                  <div className="w-full h-full flex flex-col items-center justify-center text-brand-dark/40 bg-gray-50">
                    <CheckCircle size={24} className="text-green-500 mb-1" />
                    <span className="text-[10px] text-center px-2">Ref guardada</span>
                  </div>
                  <button onClick={() => removeImage(img._key)} className="absolute top-1 right-1 bg-white rounded-full text-red-500 shadow-sm"><XCircle size={20} weight="fill"/></button>
                </div>
              ))}
              
              <label className={`cursor-pointer aspect-square rounded-lg border-2 border-dashed border-brand-pink/50 flex flex-col items-center justify-center text-brand-dark/50 hover:bg-brand-pink/10 transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                <Plus size={24} className="mb-1" />
                <span className="text-xs font-medium text-center">{uploadingImage ? 'Subiendo...' : 'Añadir Fotos'}</span>
              </label>
            </div>
            <p className="text-[10px] text-brand-dark/50">Nota: Al guardar y recargar, las imágenes se procesarán en Sanity. El formato será optimizado a WebP automáticamente.</p>
          </div>
        </div>
      </div>

      {/* Sección Completa de Personalización para Productos A Pedido */}
      {formData.type === 'custom' && (
        <div className="mt-8 bg-white p-6 rounded-3xl border border-brand-pink/30 shadow-sm">
          <CustomizationBuilder 
            options={formData.customizationOptions || []}
            onChange={(newOptions) => setFormData(prev => ({ ...prev, customizationOptions: newOptions }))}
            accessories={accessories}
            adminHash={adminHash}
          />
        </div>
      )}
    </div>
  );
};
