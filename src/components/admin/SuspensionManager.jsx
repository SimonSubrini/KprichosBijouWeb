import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useSettingsStore } from '../../store/settingsStore';
import { WarningCircle, CheckCircle, ToggleLeft, ToggleRight, FloppyDisk, HandPalm } from '@phosphor-icons/react';

export const SuspensionManager = ({ adminHash }) => {
  const [isSuspended, setIsSuspended] = useState(false);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const updateSettingsState = useSettingsStore(state => state.updateSettingsState);

  useEffect(() => {
    // Consultar el estado en tiempo real para la administración
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { 'Authorization': adminHash }
        });
        if (res.ok) {
          const data = await res.json();
          setIsSuspended(Boolean(data?.customOrdersSuspended));
          setMessage(data?.suspensionMessage || 'De momento no se están tomando pedidos personalizados debido a la saturación actual en nuestro taller artesanal.');
        }
      } catch (err) {
        console.error('Error fetching admin settings:', err);
      }
    };
    if (adminHash) {
      fetchSettings();
    }
  }, [adminHash]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminHash
        },
        body: JSON.stringify({
          customOrdersSuspended: isSuspended,
          suspensionMessage: message
        })
      });

      if (res.ok) {
        const updated = await res.json();
        updateSettingsState({
          customOrdersSuspended: Boolean(updated.customOrdersSuspended),
          suspensionMessage: updated.suspensionMessage
        });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
    setIsSaving(false);
  };

  return (
    <div className={`mb-8 p-6 rounded-3xl border transition-all shadow-sm ${isSuspended ? 'bg-brand-light/60 border-brand-pink' : 'bg-green-50/70 border-green-200'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isSuspended ? 'bg-brand-magenta text-white shadow-sm shadow-pink-200' : 'bg-green-600 text-white shadow-sm shadow-green-200'}`}>
            {isSuspended ? <HandPalm size={26} weight="fill" /> : <CheckCircle size={26} weight="fill" />}
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-brand-dark flex items-center gap-2">
              Estado de Toma de Pedidos Personalizados
            </h3>
            <p className="text-sm text-brand-dark/70">
              {isSuspended 
                ? 'La toma de nuevos pedidos personalizados está SUSPENDIDA para los clientes.' 
                : 'La tienda está tomando pedidos personalizados con normalidad.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSuspended(!isSuspended)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all border shadow-sm ${
            isSuspended 
              ? 'bg-brand-magenta hover:bg-brand-magenta/90 text-white border-brand-magenta' 
              : 'bg-white hover:bg-gray-50 text-brand-dark border-gray-300'
          }`}
        >
          {isSuspended ? (
            <>
              <ToggleRight size={28} weight="fill" />
              <span>Suspendido</span>
            </>
          ) : (
            <>
              <ToggleLeft size={28} weight="regular" className="text-gray-400" />
              <span>Activo (Normal)</span>
            </>
          )}
        </button>
      </div>

      {isSuspended && (
        <div className="mt-4 pt-4 border-t border-brand-pink/50 animate-fade-in">
          <label className="block text-sm font-bold text-brand-dark mb-2 flex items-center gap-2">
            <WarningCircle size={18} weight="bold" className="text-brand-magenta" />
            Mensaje explicativo para el comprador (Visible al entrar a la web y en los productos personalizados):
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Ej: De momento no se están tomando pedidos personalizados debido a alta demanda en nuestro taller artesanal. Reabriremos agenda a partir del 15 de agosto. ¡Gracias por la paciencia!"
            className="w-full p-3 bg-white border border-brand-pink/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta text-brand-dark text-sm shadow-inner"
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-3">
        {saveStatus === 'success' && (
          <span className="text-sm font-bold text-green-700 flex items-center gap-1 animate-fade-in">
            <CheckCircle size={18} weight="bold" /> ¡Configuración guardada correctamente en Sanity!
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm font-bold text-red-600 flex items-center gap-1 animate-fade-in">
            <WarningCircle size={18} weight="bold" /> Error al guardar configuración.
          </span>
        )}
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          variant="primary"
          size="sm"
          className="flex items-center gap-2 shadow-sm"
        >
          <FloppyDisk size={18} weight="bold" />
          {isSaving ? 'Guardando...' : 'Guardar Estado'}
        </Button>
      </div>
    </div>
  );
};
