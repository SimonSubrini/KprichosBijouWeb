import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../lib/sanity';
import { ProductCard } from '../components/ui/ProductCard';
import { useSearchParams } from 'react-router-dom';

export const Catalogo = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const filterType = searchParams.get('type');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = filterType 
    ? products.filter(p => p.type === filterType) 
    : products;

  const handleFilter = (type) => {
    if (type) {
      setSearchParams({ type });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-display font-bold text-brand-dark mb-4">Nuestro Catálogo</h2>
        <p className="text-brand-dark/70 max-w-2xl mx-auto mb-8">
          Descubre nuestra colección de piezas únicas de resina. Todo hecho a mano y con mucho amor.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => handleFilter('')}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${!filterType ? 'bg-brand-magenta text-white shadow-md' : 'bg-white text-brand-dark border border-brand-pink/50 hover:border-brand-magenta'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => handleFilter('stock')}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${filterType === 'stock' ? 'bg-brand-magenta text-white shadow-md' : 'bg-white text-brand-dark border border-brand-pink/50 hover:border-brand-magenta'}`}
          >
            En Stock
          </button>
          <button 
            onClick={() => handleFilter('custom')}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${filterType === 'custom' ? 'bg-brand-magenta text-white shadow-md' : 'bg-white text-brand-dark border border-brand-pink/50 hover:border-brand-magenta'}`}
          >
            A Pedido
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-magenta"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-brand-pink/20 max-w-2xl mx-auto">
          <h3 className="text-2xl font-display font-bold text-brand-dark mb-3">
            {filterType ? 'No hay productos de este tipo' : 'Aún no hay productos'}
          </h3>
          <p className="text-brand-dark/60">
            {filterType ? 'Prueba cambiando el filtro de búsqueda.' : 'Los productos que agregues en el panel de Sanity aparecerán aquí automáticamente.'}
          </p>
        </div>
      )}
    </div>
  );
};
