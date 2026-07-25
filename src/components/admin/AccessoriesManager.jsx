import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Trash, EyeSlash, Eye, Plus, PencilSimple, Image as ImageIcon, CheckCircle, XCircle } from '@phosphor-icons/react';
import { compressImageToWebP } from '../../utils/imageCompressor';

export const AccessoriesManager = ({ accessories, adminHash, onRefresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null); // null = list mode, object = edit mode

  const handleCreateNew = () => {
    setEditingAcc({
      _id: 'new',
      _type: 'accessory',
      name: '',
      stockType: 'finite',
      options: [],
      isArchived: false
    });
  };

  const handleSave = async (accData) => {
    setIsSubmitting(true);
    try {
      const isNew = accData._id === 'new';
      const bodyData = { ...accData };
      if (isNew) delete bodyData._id;

      const res = await fetch('/api/admin/inventory', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        setEditingAcc(null);
        onRefresh();
      } else {
        alert("Error guardando accesorio");
      }
    } catch (error) {
      alert("Error de red");
    }
    setIsSubmitting(false);
  };

  const handleArchive = async (_id, isArchived) => {
    if (!confirm(`¿Estás seguro de ${isArchived ? 'archivar (ocultar de la tienda)' : 'restaurar'} este accesorio?`)) return;
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

  const handleDelete = async (acc) => {
    if (!confirm(`¿Estás seguro de que deseas BORRAR el grupo de accesorios "${acc.name}"?\n\nEsta acción eliminará el accesorio de tu panel y de la tienda (preservando el historial contable de órdenes antiguas).`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inventory?_id=${acc._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': adminHash }
      });
      if (res.ok) {
        onRefresh();
      } else {
        alert("Error al borrar el accesorio");
      }
    } catch (error) {
      alert("Error de red");
    }
    setIsSubmitting(false);
  };

  if (editingAcc) {
    return <AccessoryEditor 
      acc={editingAcc} 
      onSave={handleSave} 
      onCancel={() => setEditingAcc(null)} 
      isSubmitting={isSubmitting}
      adminHash={adminHash}
    />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-brand-dark">Grupos de Accesorios</h3>
        <Button onClick={handleCreateNew} variant="primary" className="flex items-center gap-2">
          <Plus weight="bold" /> Nuevo Grupo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accessories.length === 0 ? (
          <p className="text-brand-dark/50 col-span-2 text-center py-8">No hay accesorios creados.</p>
        ) : (
          accessories.map(acc => (
            <div key={acc._id} className={`p-5 rounded-2xl border ${acc.isArchived ? 'bg-gray-50 border-gray-200' : 'bg-white border-brand-pink/30 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className={`font-display font-bold text-lg ${acc.isArchived ? 'text-gray-400 line-through' : 'text-brand-dark'}`}>
                    {acc.name}
                  </h4>
                  <p className="text-xs font-bold text-brand-magenta uppercase tracking-wider">
                    {acc.stockType === 'finite' ? 'Stock Finito' : 'Stock Infinito'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingAcc(acc)} title="Editar" className="p-2 bg-brand-light/40 text-brand-dark hover:text-brand-magenta rounded-lg transition-colors">
                    <PencilSimple size={18} />
                  </button>
                  <button onClick={() => handleArchive(acc._id, !acc.isArchived)} title={acc.isArchived ? "Mostrar en tienda" : "Ocultar temporalmente de la tienda"} className={`p-2 rounded-lg transition-colors ${acc.isArchived ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {acc.isArchived ? <Eye size={18} /> : <EyeSlash size={18} />}
                  </button>
                  <button onClick={() => handleDelete(acc)} title="Borrar del panel" className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-pink/20">
                <p className="text-sm text-brand-dark/70 mb-2"><strong>{acc.options?.length || 0}</strong> opciones registradas</p>
                <div className="flex flex-wrap gap-2">
                  {acc.options?.slice(0, 5).map(opt => (
                    <span key={opt._key} className="text-xs bg-brand-light/50 px-2 py-1 rounded-md border border-brand-pink/20">
                      {opt.value} {acc.stockType === 'finite' ? `(${opt.stockCount || 0})` : (opt.isAvailable ? '✓' : '✗')}
                    </span>
                  ))}
                  {(acc.options?.length || 0) > 5 && <span className="text-xs text-brand-dark/50">+{acc.options.length - 5} más</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AccessoryEditor = ({ acc, onSave, onCancel, isSubmitting, adminHash }) => {
  const [formData, setFormData] = useState(acc);
  const [uploadingImageKey, setUploadingImageKey] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOption = () => {
    const newOption = {
      _key: Math.random().toString(36).substring(7),
      value: 'Nueva Opción',
      stockCount: 0,
      isAvailable: true,
      image: null
    };
    setFormData({ ...formData, options: [...(formData.options || []), newOption] });
  };

  const handleUpdateOption = (key, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt => opt._key === key ? { ...opt, [field]: value } : opt)
    }));
  };

  const handleRemoveOption = (key) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt._key !== key)
    }));
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    setUploadingImageKey(key);
    try {
      const compressed = await compressImageToWebP(file, 600, 0.8);
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
        body: JSON.stringify(compressed)
      });
      if (res.ok) {
        const { asset } = await res.json();
        // Asset from Sanity format
        const imageRef = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id }
        };
        handleUpdateOption(key, 'image', imageRef);
        // Also store URL temporarily for preview if we want, but saving and reloading will fetch it.
        // Actually, we can just save the ref. Sanity dashboard will render it. Our admin doesn't need to preview it instantly unless we build it.
        alert("Imagen subida con éxito");
      } else {
        alert("Error al subir imagen");
      }
    } catch (error) {
      alert("Error de red al subir imagen");
    }
    setUploadingImageKey(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-brand-dark">
          {acc._id === 'new' ? 'Crear Nuevo Accesorio' : 'Editar Accesorio'}
        </h3>
        <button onClick={onCancel} className="p-2 text-brand-dark/50 hover:text-brand-magenta rounded-lg transition-colors">
          <XCircle size={24} weight="fill" />
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div>
          <label className="block text-sm font-bold text-brand-dark/70 mb-2">Nombre del Grupo</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-brand-pink/40 focus:outline-none focus:border-brand-magenta bg-brand-light/10"
            placeholder="Ej. Dijes Metálicos, Tintas..."
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-dark/70 mb-2">Tipo de Stock</label>
          <select 
            name="stockType"
            value={formData.stockType}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-brand-pink/40 focus:outline-none focus:border-brand-magenta bg-brand-light/10"
          >
            <option value="finite">Finito (Cantidades específicas)</option>
            <option value="infinite">Infinito (Hay / No hay)</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-end border-b border-brand-pink/20 pb-4">
        <div>
          <h4 className="font-bold text-brand-dark text-lg">Opciones Disponibles</h4>
          <p className="text-sm text-brand-dark/60">Carga cada una de las variables para este accesorio.</p>
        </div>
        <Button onClick={handleAddOption} variant="outline" size="sm" className="flex items-center gap-2">
          <Plus weight="bold" /> Añadir Opción
        </Button>
      </div>

      <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
        {formData.options?.map((opt, idx) => (
          <div key={opt._key} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-white border border-brand-pink/30 rounded-xl shadow-sm relative">
            
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-bold text-brand-dark/50 uppercase mb-1">Nombre / Valor</label>
              <input 
                type="text" 
                value={opt.value}
                onChange={(e) => handleUpdateOption(opt._key, 'value', e.target.value)}
                className="w-full p-2 text-sm rounded-lg border border-brand-pink/30 focus:outline-none focus:border-brand-magenta"
                placeholder="Ej. Corazón, Rojo..."
              />
            </div>

            <div className="w-full md:w-1/4">
              {formData.stockType === 'finite' ? (
                <>
                  <label className="block text-xs font-bold text-brand-dark/50 uppercase mb-1">Stock (Uds)</label>
                  <input 
                    type="number" 
                    value={opt.stockCount}
                    onChange={(e) => handleUpdateOption(opt._key, 'stockCount', Number(e.target.value))}
                    className="w-full p-2 text-sm rounded-lg border border-brand-pink/30 focus:outline-none focus:border-brand-magenta"
                  />
                </>
              ) : (
                <>
                  <label className="block text-xs font-bold text-brand-dark/50 uppercase mb-1">Disponibilidad</label>
                  <select 
                    value={opt.isAvailable ? 'true' : 'false'}
                    onChange={(e) => handleUpdateOption(opt._key, 'isAvailable', e.target.value === 'true')}
                    className="w-full p-2 text-sm rounded-lg border border-brand-pink/30 focus:outline-none focus:border-brand-magenta"
                  >
                    <option value="true">Sí (Hay)</option>
                    <option value="false">No (Agotado)</option>
                  </select>
                </>
              )}
            </div>

            <div className="w-full md:w-1/4 flex flex-col justify-center">
              <label className="block text-xs font-bold text-brand-dark/50 uppercase mb-1">Imagen (Opcional)</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center justify-center p-2 border-2 border-dashed border-brand-pink/50 rounded-lg hover:bg-brand-pink/10 transition-colors flex-grow">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(opt._key, e.target.files[0])}
                    disabled={uploadingImageKey === opt._key}
                  />
                  {uploadingImageKey === opt._key ? (
                    <span className="text-xs font-medium text-brand-dark/50">Subiendo...</span>
                  ) : opt.image?.asset ? (
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1"><CheckCircle weight="fill"/> Subida</span>
                  ) : (
                    <span className="text-xs font-medium text-brand-dark/50 flex items-center gap-1"><ImageIcon /> Seleccionar</span>
                  )}
                </label>
              </div>
            </div>

            <button 
              onClick={() => handleRemoveOption(opt._key)}
              className="absolute -top-2 -right-2 bg-white text-red-400 hover:text-red-600 rounded-full shadow-md p-1 transition-colors"
            >
              <XCircle size={20} weight="fill" />
            </button>
          </div>
        ))}
        {(!formData.options || formData.options.length === 0) && (
          <p className="text-center text-brand-dark/50 py-4 bg-brand-light/20 rounded-xl border border-dashed border-brand-pink/50">
            Aún no has agregado ninguna opción.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-brand-pink/30">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button variant="primary" onClick={() => onSave(formData)} disabled={isSubmitting || !formData.name.trim()}>
          {isSubmitting ? 'Guardando...' : 'Guardar Accesorio'}
        </Button>
      </div>
    </div>
  );
};
