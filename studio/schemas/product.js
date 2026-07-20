export default {
  name: 'product',
  title: 'Producto',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nombre',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text',
    },
    {
      name: 'basePrice',
      title: 'Precio Base',
      type: 'number',
    },
    {
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'type',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          { title: 'Stock (Disponibilidad inmediata)', value: 'stock' },
          { title: 'Personalizado (A pedido)', value: 'custom' }
        ],
        layout: 'radio'
      }
    },
    {
      name: 'stockCount',
      title: 'Cantidad en Stock',
      type: 'number',
      hidden: ({ document }) => document?.type !== 'stock',
    },
    {
      name: 'customizationOptions',
      title: 'Opciones de Personalización',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'optionName', title: 'Nombre de la opción (ej. Letra, Color)', type: 'string' },
            { name: 'choices', title: 'Opciones (separadas por coma)', type: 'string' },
            { name: 'extraCost', title: 'Costo Adicional (Opcional)', type: 'number' }
          ]
        }
      ],
      hidden: ({ document }) => document?.type !== 'custom',
    }
  ]
}
