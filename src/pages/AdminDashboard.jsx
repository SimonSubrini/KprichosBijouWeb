import React, { useState, useEffect } from 'react';
import { hashPassword } from '../utils/hash';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { SuspensionManager } from '../components/admin/SuspensionManager';
import { LockKey, SignOut, Eye, CheckCircle, Clock, Truck, XCircle, CurrencyCircleDollar, Package, Funnel, Calendar, CaretDown, Check, ArrowsCounterClockwise, TrendUp, Wallet, ShoppingBag } from '@phosphor-icons/react';

const STATUS_CONFIG = {
  pendiente_contacto: { label: 'Pendiente de contacto', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  pendiente_hacer: { label: 'Pendiente de hacer', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Package },
  en_curso: { label: 'En curso', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
  terminado: { label: 'Terminado', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle },
  enviado: { label: 'Enviado', color: 'bg-green-100 text-green-800 border-green-200', icon: Truck },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
};

const PAYMENT_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
  senado: { label: 'Señado', color: 'bg-blue-100 text-blue-800' },
  pagado: { label: 'Pagado Total', color: 'bg-green-100 text-green-800' }
};

export const AdminDashboard = () => {
  const { isAuthenticated, adminHash, login, logout } = useAuthStore();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtros de órdenes
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Filtrado dinámico de órdenes
  const filteredOrders = orders.filter(order => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(order.status)) {
      return false;
    }
    if (startDate) {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (orderDate < startDate) return false;
    }
    if (endDate) {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (orderDate > endDate) return false;
    }
    return true;
  });

  // Cálculo de Métricas Financieras sobre filteredOrders
  const metrics = filteredOrders.reduce((acc, order) => {
    if (order.status === 'cancelado') return acc;
    const total = order.totalPrice || 0;
    let paid = 0;
    if (order.paymentStatus === 'pagado' && !order.amountPaid) {
      paid = total;
    } else {
      paid = order.amountPaid || 0;
    }
    const remaining = Math.max(0, total - paid);

    return {
      totalRevenue: acc.totalRevenue + paid,
      pendingRevenue: acc.pendingRevenue + remaining,
      activeOrdersCount: acc.activeOrdersCount + 1
    };
  }, { totalRevenue: 0, pendingRevenue: 0, activeOrdersCount: 0 });

  const toggleStatusSelection = (statusKey) => {
    setSelectedStatuses(prev => 
      prev.includes(statusKey) ? prev.filter(s => s !== statusKey) : [...prev, statusKey]
    );
  };

  const resetFilters = () => {
    setSelectedStatuses([]);
    setStartDate('');
    setEndDate('');
  };

  // Comprobar sesión al cargar
  useEffect(() => {
    if (adminHash) {
      fetchOrders(adminHash);
    }
  }, [adminHash]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const hash = await hashPassword(password);
      await fetchOrders(hash);
    } catch (err) {
      setLoginError('Error al procesar la contraseña');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    logout();
    setOrders([]);
    setPassword('');
  };

  const fetchOrders = async (token = adminHash) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        login(token);
        setLoginError('');
      } else {
        logout();
        setLoginError('Contraseña incorrecta');
      }
    } catch (error) {
      setLoginError('Error de conexión');
    }
    setIsLoading(false);
  };

  const handleUpdateOrder = async (orderId, updates) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/update-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': adminHash 
        },
        body: JSON.stringify({ orderId, ...updates })
      });
      if (res.ok) {
        // Refrescar órdenes
        await fetchOrders(adminHash);
        // Actualizar la orden seleccionada localmente si el modal está abierto
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, ...updates }));
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al actualizar la orden: ${errorData.message || res.statusText || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error al actualizar la orden:', error);
      alert("Error al actualizar la orden: " + (error.message || 'Error de red'));
    }
    setIsUpdating(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-brand-light/30 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-pink/20 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-magenta/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-magenta">
            <LockKey size={32} weight="duotone" />
          </div>
          <h2 className="text-3xl font-display font-bold text-brand-dark mb-2">Acceso Admin</h2>
          <p className="text-brand-dark/60 mb-8">Ingresa la contraseña maestra para gestionar Kprichos Bijou</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full p-4 border-2 border-brand-pink/30 rounded-xl focus:outline-none focus:border-brand-magenta text-center text-lg tracking-widest"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
            <Button type="submit" variant="primary" className="w-full py-4" disabled={isLoggingIn}>
              {isLoggingIn ? 'Verificando...' : 'Entrar al Panel'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light/20 pb-20">
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <SuspensionManager adminHash={adminHash} />
        
        {!isLoading && (
          <>
            {/* Tarjetas de Métricas de Ingresos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-pink/20 flex items-center gap-5">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                  <TrendUp size={32} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Recaudado hasta el momento</p>
                  <h4 className="text-3xl font-display font-bold text-green-700 mt-1">${metrics.totalRevenue}</h4>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-pink/20 flex items-center gap-5">
                <div className="w-14 h-14 bg-brand-magenta/10 text-brand-magenta rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Wallet size={32} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Por Cobrar (Pendiente / Señas)</p>
                  <h4 className="text-3xl font-display font-bold text-brand-magenta mt-1">${metrics.pendingRevenue}</h4>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-pink/20 flex items-center gap-5">
                <div className="w-14 h-14 bg-brand-light/70 text-brand-dark rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                  <ShoppingBag size={32} weight="duotone" className="text-brand-magenta" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Órdenes Mostradas</p>
                  <h4 className="text-3xl font-display font-bold text-brand-dark mt-1">{filteredOrders.length} <span className="text-xs font-normal text-brand-dark/60 font-sans">({metrics.activeOrdersCount} activas)</span></h4>
                </div>
              </div>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-pink/20 mb-8 flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
              <div className="flex flex-wrap items-center gap-4 flex-grow">
                
                {/* Combobox Múltiple para Estados */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-light/30 border border-brand-pink/40 hover:border-brand-magenta rounded-2xl text-sm font-medium text-brand-dark transition-all shadow-sm min-w-[220px]"
                  >
                    <span className="flex items-center gap-2">
                      <Funnel size={18} className="text-brand-magenta" />
                      {selectedStatuses.length === 0 ? (
                        'Todos los estados'
                      ) : (
                        `Filtrando (${selectedStatuses.length} estado${selectedStatuses.length > 1 ? 's' : ''})`
                      )}
                    </span>
                    <CaretDown size={16} className="text-brand-dark/60" />
                  </button>

                  {isStatusDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsStatusDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-brand-pink/30 z-30 p-3 animate-scale-up">
                        <div className="flex justify-between items-center pb-2 mb-2 border-b border-brand-pink/20 text-xs font-bold text-brand-dark/70">
                          <span>SELECCIONAR ESTADOS</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedStatuses(selectedStatuses.length === Object.keys(STATUS_CONFIG).length ? [] : Object.keys(STATUS_CONFIG))}
                            className="text-brand-magenta hover:underline"
                          >
                            {selectedStatuses.length === Object.keys(STATUS_CONFIG).length ? 'Desmarcar todos' : 'Marcar todos'}
                          </button>
                        </div>
                        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                            const isChecked = selectedStatuses.includes(key);
                            return (
                              <div
                                key={key}
                                onClick={() => toggleStatusSelection(key)}
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all text-sm ${isChecked ? 'bg-brand-light/60 font-semibold text-brand-dark' : 'hover:bg-brand-light/30 text-brand-dark/80'}`}
                              >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isChecked ? 'bg-brand-magenta border-brand-magenta text-white' : 'border-gray-300 bg-white'}`}>
                                  {isChecked && <Check size={14} weight="bold" />}
                                </div>
                                <span className="flex-grow">{config.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Filtros de Fecha */}
                <div className="flex items-center gap-2 bg-brand-light/30 border border-brand-pink/40 rounded-2xl px-4 py-2 text-sm shadow-sm flex-wrap">
                  <Calendar size={18} className="text-brand-magenta flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-dark/60">Desde:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-brand-dark font-medium focus:outline-none focus:text-brand-magenta text-xs md:text-sm"
                    />
                  </div>
                  <span className="text-brand-pink mx-1">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-dark/60">Hasta:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-brand-dark font-medium focus:outline-none focus:text-brand-magenta text-xs md:text-sm"
                    />
                  </div>
                </div>
              </div>

              {(selectedStatuses.length > 0 || startDate || endDate) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-sm text-brand-magenta hover:text-brand-dark font-semibold transition-colors px-3 py-1 bg-brand-pink/10 hover:bg-brand-pink/20 rounded-xl w-fit self-end lg:self-center"
                >
                  <ArrowsCounterClockwise size={16} weight="bold" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </>
        )}

        {isLoading && orders.length === 0 ? (
          <div className="text-center py-20 text-brand-dark/50">Cargando órdenes...</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-brand-pink/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-light/50 border-b border-brand-pink/20">
                    <th className="p-4 font-semibold text-brand-dark/70 text-sm">ID Orden</th>
                    <th className="p-4 font-semibold text-brand-dark/70 text-sm">Fecha</th>
                    <th className="p-4 font-semibold text-brand-dark/70 text-sm">Cliente</th>
                    <th className="p-4 font-semibold text-brand-dark/70 text-sm">Estado</th>
                    <th className="p-4 font-semibold text-brand-dark/70 text-sm">Pago</th>
                    <th className="p-4 font-semibold text-brand-dark/70 text-sm">Total</th>
                    <th className="p-4 font-semibold text-brand-dark/70 text-sm text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['pendiente_contacto'];
                    const payment = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG['pendiente'];
                    const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <tr key={order._id} className="border-b border-brand-pink/10 hover:bg-brand-light/30 transition-colors">
                        <td className="p-4 font-mono text-xs text-brand-dark/60">{order.orderId.split('-')[1]}</td>
                        <td className="p-4 text-sm text-brand-dark">{date}</td>
                        <td className="p-4 text-sm font-medium text-brand-dark">{order.customerInfo?.name || 'Sin datos'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            <status.icon size={14} weight="bold" />
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${payment.color}`}>
                            {payment.label}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-brand-magenta">${order.totalPrice}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-brand-dark hover:text-brand-magenta bg-white rounded-lg border border-brand-pink/30 hover:border-brand-magenta shadow-sm transition-all"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-brand-dark/50">
                        {orders.length === 0 ? 'No hay órdenes registradas.' : 'No se encontraron órdenes con los filtros seleccionados.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-brand-pink/30 flex flex-col md:flex-row">
            
            {/* Columna Izquierda: Datos */}
            <div className="w-full md:w-2/3 p-6 md:p-8 border-r border-brand-pink/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-brand-dark">Orden {selectedOrder.orderId}</h2>
                  <p className="text-sm text-brand-dark/60">{new Date(selectedOrder.createdAt).toLocaleString('es-AR')}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="md:hidden text-brand-dark/50 hover:text-brand-magenta">
                  <XCircle size={28} weight="fill" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 bg-brand-light/30 p-4 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider mb-2">Cliente</h4>
                  <p className="font-medium text-brand-dark">{selectedOrder.customerInfo?.name || 'N/A'}</p>
                  <p className="text-sm text-brand-dark/80">{selectedOrder.customerInfo?.phone}</p>
                  <p className="text-sm text-brand-dark/80">{selectedOrder.customerInfo?.email}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider mb-2">Envío</h4>
                  <p className="font-medium text-brand-dark">
                    {selectedOrder.customerInfo?.shippingMethod === 'correo' ? 'Correo Argentino' : 'Retiro por local'}
                  </p>
                  {selectedOrder.customerInfo?.shippingMethod === 'correo' && (
                    <p className="text-sm text-brand-dark/80 mt-1">
                      {selectedOrder.customerInfo.street} {selectedOrder.customerInfo.number} {selectedOrder.customerInfo.floor}<br />
                      {selectedOrder.customerInfo.city}, {selectedOrder.customerInfo.province} (CP: {selectedOrder.customerInfo.postalCode})
                    </p>
                  )}
                </div>
                {selectedOrder.customerInfo?.notes && (
                  <div className="col-span-2">
                    <h4 className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider mb-1">Notas</h4>
                    <p className="text-sm text-brand-dark italic bg-white p-2 rounded border border-brand-pink/20">"{selectedOrder.customerInfo.notes}"</p>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-brand-dark mb-4 border-b border-brand-pink/20 pb-2">Artículos</h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-white border border-brand-pink/20 rounded-xl">
                    {item.product?.imageUrl ? (
                      <img src={`${item.product.imageUrl}?w=100&auto=format&fit=crop`} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-brand-light rounded-lg"></div>
                    )}
                    <div>
                      <p className="font-bold text-brand-dark">
                        {item.quantity}x {item.product?.name || 'Producto Desconocido'}
                      </p>
                      {item.selectedModel && <p className="text-xs font-medium text-brand-magenta">Modelo: {item.selectedModel}</p>}
                      {item.customizations && (
                        <p className="text-xs text-brand-dark/60 mt-1 whitespace-pre-line leading-relaxed">
                          {item.customizations}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Acciones */}
            <div className="w-full md:w-1/3 bg-brand-light/30 p-6 md:p-8 flex flex-col relative">
              <button onClick={() => setSelectedOrder(null)} className="hidden md:block absolute top-6 right-6 text-brand-dark/30 hover:text-brand-magenta transition-colors">
                <XCircle size={28} weight="fill" />
              </button>
              
              <h3 className="text-xl font-display font-bold text-brand-dark mb-6 mt-4">Gestión</h3>

              <div className="space-y-6 flex-grow">
                {/* Selector de Estado */}
                <div>
                  <label className="block text-xs font-bold text-brand-dark/50 uppercase tracking-wider mb-2">Estado del Pedido</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-brand-pink/40 bg-white font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-magenta"
                    value={selectedOrder.status || 'pendiente_contacto'}
                    onChange={(e) => handleUpdateOrder(selectedOrder._id, { status: e.target.value })}
                    disabled={isUpdating}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  {selectedOrder.status === 'cancelado' && (
                    <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 p-2 rounded">
                      El stock de los productos ha sido restaurado automáticamente.
                    </p>
                  )}
                </div>

                {/* Selector de Pago */}
                <div className="bg-white p-4 rounded-xl border border-brand-pink/30">
                  <label className="block text-xs font-bold text-brand-dark/50 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <CurrencyCircleDollar size={16} /> Estado de Pago
                  </label>
                  <select 
                    className="w-full p-2 mb-4 rounded-lg border border-brand-pink/20 bg-brand-light/20 text-sm focus:outline-none"
                    value={selectedOrder.paymentStatus || 'pendiente'}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      const updates = { paymentStatus: newStatus };
                      if (newStatus === 'pagado' && (!selectedOrder.amountPaid || selectedOrder.amountPaid < selectedOrder.totalPrice)) {
                        updates.amountPaid = selectedOrder.totalPrice;
                      }
                      handleUpdateOrder(selectedOrder._id, updates);
                    }}
                    disabled={isUpdating}
                  >
                    {Object.entries(PAYMENT_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>

                  <label className="block text-xs text-brand-dark/70 mb-1">Monto Cobrado (Seña / Total)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/50 font-bold">$</span>
                      <input 
                        type="number" 
                        className="w-full pl-7 p-2 border border-brand-pink/30 rounded-lg focus:outline-none focus:border-brand-magenta text-brand-dark font-medium"
                        defaultValue={selectedOrder.amountPaid || 0}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== selectedOrder.amountPaid) {
                            handleUpdateOrder(selectedOrder._id, { amountPaid: val });
                          }
                        }}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-pink/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-brand-dark/60 text-sm">Total del Pedido</span>
                  <span className="font-bold text-brand-dark">${selectedOrder.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-dark/60">Pagado</span>
                  <span className="font-bold text-green-600">${selectedOrder.amountPaid || 0}</span>
                </div>
                <div className="flex justify-between items-center text-lg mt-2 pt-2 border-t border-brand-pink/20">
                  <span className="font-bold font-display text-brand-dark">Restante</span>
                  <span className="font-bold font-display text-brand-magenta">
                    ${Math.max(0, selectedOrder.totalPrice - (selectedOrder.amountPaid || 0))}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
