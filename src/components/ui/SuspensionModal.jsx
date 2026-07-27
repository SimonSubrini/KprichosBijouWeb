import React, { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Button } from './Button';
import { WarningCircle, X, Package } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';

export const SuspensionModal = () => {
  const { customOrdersSuspended, suspensionMessage, isModalDismissed, loadSettings, dismissModal } = useSettingsStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // No mostrar en páginas de admin
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  if (!customOrdersSuspended || isModalDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-4 border-brand-magenta relative text-center transform animate-scale-up">
        <button 
          onClick={dismissModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-brand-dark rounded-full hover:bg-gray-100 transition-colors"
          title="Cerrar aviso"
        >
          <X size={22} weight="bold" />
        </button>

        <div className="w-16 h-16 bg-brand-magenta/15 text-brand-magenta rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <WarningCircle size={40} weight="fill" />
        </div>

        <h3 className="text-2xl font-display font-bold text-brand-dark mb-2">
          Aviso sobre Pedidos Personalizados
        </h3>

        <div className="bg-brand-light/40 border border-brand-pink/50 rounded-2xl p-4 my-4 text-left text-brand-dark/90 leading-relaxed font-normal">
          {suspensionMessage || 'De momento no se están tomando pedidos personalizados debido a alta demanda y saturación temporal en nuestro taller artesanal.'}
        </div>

        <div className="flex items-center gap-3 p-3 bg-brand-light/50 rounded-xl mb-6 text-xs md:text-sm text-brand-dark/80 text-left border border-brand-pink/30">
          <Package size={28} weight="duotone" className="text-brand-magenta flex-shrink-0" />
          <span>
            <strong>¡Buenas noticias!</strong> Puedes seguir explorando y comprando todos nuestros productos en <strong>Stock Inmediato</strong> y se despacharán con total normalidad.
          </span>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          className="w-full justify-center py-3 text-base shadow-md"
          onClick={() => {
            dismissModal();
            navigate('/productos');
          }}
        >
          Entendido, ver catálogo en stock
        </Button>
      </div>
    </div>
  );
};
