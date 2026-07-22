import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Button } from './components/ui/Button';
import { Catalogo } from './pages/Catalogo';
import { Carrito } from './pages/Carrito';
import { Envios } from './pages/Envios';
import { ComoComprar } from './pages/ComoComprar';
import { PreguntasFrecuentes } from './pages/PreguntasFrecuentes';
import { Resenas } from './pages/Resenas';
import { SobreNosotros } from './pages/SobreNosotros';
import { ProductoDetalle } from './pages/ProductoDetalle';
import { AdminDashboard } from './pages/AdminDashboard';

const Home = () => (
  <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center space-y-10 animate-fade-in">
    <div className="relative group">
      <div className="absolute inset-0 bg-brand-magenta rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      <div className="relative inline-block p-2 bg-white rounded-full shadow-2xl border-4 border-brand-pink/60">
        <img src="/logo.jpg" alt="Logo Kprichos Bijou" className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover" />
      </div>
    </div>
    
    <div className="max-w-3xl space-y-6 px-4">
      <h1 className="text-4xl md:text-6xl font-bold font-display text-brand-dark leading-tight tracking-tight">
        Accesorios únicos en <br className="hidden md:block" />
        <span className="text-brand-magenta relative inline-block mt-2">
          Resina Epóxica
          <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-pink opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
          </svg>
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto font-light leading-relaxed">
        Personaliza tus llaveros y souvenirs con colores, nombres y diseños exclusivos. Un capricho hecho totalmente a tu medida.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8 w-full sm:w-auto px-4">
      <Link to="/productos" className="w-full sm:w-auto">
        <Button variant="primary" size="lg" className="w-full">Explorar Catálogo</Button>
      </Link>
      <Link to="/productos?type=custom" className="w-full sm:w-auto">
        <Button variant="outline" size="lg" className="w-full">Ver Personalizados</Button>
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/envios" element={<Envios />} />
          <Route path="/como-comprar" element={<ComoComprar />} />
          <Route path="/preguntas" element={<PreguntasFrecuentes />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
