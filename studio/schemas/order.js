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
            { name: 'customizations', title: 'Personalizaciones Elegidas', type: 'string' }
          ]
        }
      ]
    },
    {
      name: 'totalPrice',
      title: 'Precio Total',
      type: 'number',
    },
    {
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Pendiente de contacto', value: 'pendiente' },
          { title: 'Confirmado', value: 'confirmado' },
          { title: 'Cancelado', value: 'cancelado' }
        ]
      },
      initialValue: 'pendiente'
    }
  ]
}
