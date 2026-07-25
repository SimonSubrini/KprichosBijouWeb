import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Trash, EyeSlash, Eye, Plus, PencilSimple } from '@phosphor-icons/react';

export const CategoriesManager = ({ categories, adminHash, onRefresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
        body: JSON.stringify({ _type: 'category', name: newCategoryName.trim() })
      });
      if (res.ok) {
        setNewCategoryName('');
        onRefresh();
      } else {
        alert("Error creando categoría");
      }
    } catch (error) {
      alert("Error de red");
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (_id, updates) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminHash },
        body: JSON.stringify({ _id, ...updates })
      });
      if (res.ok) {
        setEditingId(null);
        onRefresh();
      } else {
        alert("Error actualizando categoría");
      }
    } catch (error) {
      alert("Error de red");
    }
    setIsSubmitting(false);
  };

  const handleArchive = async (_id, isArchived) => {
    if (!confirm(`¿Estás seguro de ${isArchived ? 'archivar' : 'restaurar'} esta categoría?`)) return;
    handleUpdate(_id, { isArchived });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-brand-dark">Categorías</h3>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8 bg-brand-light/20 p-4 rounded-xl border border-brand-pink/20">
        <input 
          type="text" 
          placeholder="Nombre de la nueva categoría..." 
          className="flex-grow p-3 rounded-lg border border-brand-pink/30 focus:outline-none focus:border-brand-magenta"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" variant="primary" disabled={isSubmitting || !newCategoryName.trim()} className="flex items-center gap-2">
          <Plus weight="bold" /> Crear
        </Button>
      </form>

      <div className="grid gap-3">
        {categories.length === 0 ? (
          <p className="text-brand-dark/50 text-center py-8">No hay categorías creadas.</p>
        ) : (
          categories.map(cat => (
            <div key={cat._id} className={`flex items-center justify-between p-4 rounded-xl border ${cat.isArchived ? 'bg-gray-50 border-gray-200' : 'bg-white border-brand-pink/30'}`}>
              
              {editingId === cat._id ? (
                <div className="flex flex-grow items-center gap-3 mr-4">
                  <input 
                    type="text" 
                    className="flex-grow p-2 rounded-lg border border-brand-magenta focus:outline-none"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(cat._id, { name: editingName })} className="px-4 py-2 bg-brand-magenta text-white rounded-lg text-sm font-bold">
                    Guardar
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${cat.isArchived ? 'text-gray-400 line-through' : 'text-brand-dark'}`}>
                    {cat.name}
                  </span>
                  {cat.isArchived && <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">Archivada</span>}
                </div>
              )}

              {editingId !== cat._id && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingId(cat._id); setEditingName(cat.name); }}
                    className="p-2 text-brand-dark/50 hover:text-brand-magenta transition-colors bg-brand-light/30 rounded-lg"
                    title="Editar nombre"
                  >
                    <PencilSimple size={20} />
                  </button>
                  <button 
                    onClick={() => handleArchive(cat._id, !cat.isArchived)}
                    className={`p-2 transition-colors rounded-lg ${cat.isArchived ? 'text-green-500 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
                    title={cat.isArchived ? 'Restaurar' : 'Archivar (ocultar)'}
                  >
                    {cat.isArchived ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
