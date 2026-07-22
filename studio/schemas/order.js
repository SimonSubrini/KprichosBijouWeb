export default {
  name: 'order',
  title: 'Orden de Compra',
  type: 'document',
  fields: [
    {
      name: 'orderId',
      title: 'ID de Orden',
      type: 'string',
    },
    {
      name: 'createdAt',
      title: 'Fecha de Creación',
      type: 'datetime',
    },
    {
      name: 'items',
      title: 'Artículos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'product', title: 'Producto', type: 'reference', to: [{ type: 'product' }] },
            { name: 'quantity', title: 'Cantidad', type: 'number' },
            { name: 'customizations', title: 'Personalizaciones Elegidas', type: 'string' },
            { name: 'selectedModel', title: 'Modelo Elegido (Si aplica)', type: 'string' }
          ]
        }
      ]
    },
    {
      name: 'customerInfo',
      title: 'Datos del Cliente / Envío',
      type: 'object',
      fields: [
        { name: 'name', title: 'Nombre', type: 'string' },
        { name: 'phone', title: 'Teléfono', type: 'string' },
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'shippingMethod', title: 'Método de Envío', type: 'string' },
        { name: 'address', title: 'Dirección (Si es envío)', type: 'string' },
        { name: 'province', title: 'Provincia', type: 'string' },
        { name: 'city', title: 'Localidad', type: 'string' },
        { name: 'postalCode', title: 'Código Postal', type: 'string' },
        { name: 'notes', title: 'Observaciones', type: 'text' }
      ]
    },
    {
      name: 'totalPrice',
      title: 'Precio Total',
      type: 'number',
    },
    {
      name: 'status',
      title: 'Estado del Pedido',
      type: 'string',
      options: {
        list: [
          { title: 'Pendiente de contacto', value: 'pendiente_contacto' },
          { title: 'Pendiente de hacer', value: 'pendiente_hacer' },
          { title: 'En curso', value: 'en_curso' },
          { title: 'Terminado', value: 'terminado' },
          { title: 'Enviado', value: 'enviado' },
          { title: 'Cancelado', value: 'cancelado' }
        ]
      },
      initialValue: 'pendiente_contacto'
    },
    {
      name: 'paymentStatus',
      title: 'Estado del Pago',
      type: 'string',
      options: {
        list: [
          { title: 'Pendiente', value: 'pendiente' },
          { title: 'Señado', value: 'senado' },
          { title: 'Pagado Totalmente', value: 'pagado' }
        ]
      },
      initialValue: 'pendiente'
    },
    {
      name: 'amountPaid',
      title: 'Monto Señado / Pagado',
      type: 'number',
      initialValue: 0
    }
  ]
}
