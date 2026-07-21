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
      title: 'Resumen',
      type: 'text',
      description: 'Breve descripción que se muestra en la tarjeta del producto.'
    },
    {
      name: 'longDescription',
      title: 'Descripción Larga',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Descripción completa que se muestra en la página de detalle del producto.'
    },
    {
      name: 'basePrice',
      title: 'Precio Base',
      type: 'number',
      hidden: ({ document }) => document?.hasModels,
    },
    {
      name: 'hasModels',
      title: '¿Tiene distintos modelos/tamaños con diferentes precios?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'models',
      title: 'Modelos Disponibles',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Nombre del modelo (ej. Tamaño A4)', type: 'string' },
            { name: 'price', title: 'Precio de este modelo', type: 'number' },
            { name: 'stockCount', title: 'Cantidad en Stock', type: 'number' },
          ]
        }
      ],
      hidden: ({ document }) => !document?.hasModels,
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
      title: 'Cantidad en Stock (Base)',
      type: 'number',
      hidden: ({ document }) => document?.type !== 'stock' || document?.hasModels,
    },
    {
      name: 'customizationOptions',
      title: 'Opciones de Personalización',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'optionName', title: 'Nombre de la opción (ej. Frase, Letra, Color)', type: 'string' },
            {
              name: 'type',
              title: 'Tipo de entrada',
              type: 'string',
              options: {
                list: [
                  { title: 'Lista de Opciones (Select)', value: 'list' },
                  { title: 'Texto Libre (Input)', value: 'text' }
                ],
                layout: 'radio'
              },
              initialValue: 'list'
            },
            { 
              name: 'choices', 
              title: 'Opciones (separadas por coma)', 
              type: 'string',
              hidden: ({parent}) => parent?.type === 'text'
            },
            { name: 'extraCost', title: 'Costo Adicional (Opcional)', type: 'number' }
          ]
        }
      ],
      hidden: ({ document }) => document?.type !== 'custom',
    }
  ]
}
