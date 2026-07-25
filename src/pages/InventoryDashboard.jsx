import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { Package, PlusCircle } from '@phosphor-icons/react';
import { AccessoriesManager } from '../components/admin/AccessoriesManager';
import { ProductsManager } from '../components/admin/ProductsManager';

export const InventoryDashboard = () => {
  const { isAuthenticated, adminHash } = useAuthStore();
  const [activeTab, setActiveTab] = useState('products');
  const [data, setData] = useState({ products: [], accessories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        headers: { 'Authorization': adminHash }
      });
      if (res.ok) {
        const inventoryData = await res.json();
        setData(inventoryData);
      } else {
        console.error("Error fetching inventory");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const tabs = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'accessories', label: 'Accesorios', icon: PlusCircle }
  ];

  return (
    <div className="min-h-screen bg-brand-light/20 pb-20">
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-3xl font-display font-bold text-brand-dark mb-6">Gestión de Inventario</h2>
        
        {/* Pestañas */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-brand-pink/20 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-brand-magenta text-white shadow-md' : 'text-brand-dark/60 hover:bg-brand-light/50 hover:text-brand-magenta'}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-magenta"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-brand-pink/20 p-6">
            {activeTab === 'accessories' && (
              <AccessoriesManager 
                accessories={data.accessories} 
                adminHash={adminHash} 
                onRefresh={fetchInventory} 
              />
            )}
            {activeTab === 'products' && (
              <ProductsManager 
                products={data.products} 
                accessories={data.accessories}
                adminHash={adminHash} 
                onRefresh={fetchInventory} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
