export default {
  name: 'accessory',
  title: 'Accesorios (Add-ons)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nombre del grupo (ej. Dijes Metálicos, Tintas)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'stockType',
      title: 'Tipo de Stock',
      type: 'string',
      options: {
        list: [
          { title: 'Finito (Cantidades específicas)', value: 'finite' },
          { title: 'Infinito / No cuantificable (Ej. Tintas)', value: 'infinite' }
        ],
        layout: 'radio'
      },
      initialValue: 'finite',
      validation: Rule => Rule.required()
    },
    {
      name: 'isArchived',
      title: 'Archivado (Oculto)',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'isDeleted',
      title: 'Borrado (Eliminado de UI)',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'options',
      title: 'Opciones de Accesorio',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { 
              name: 'value', 
              title: 'Valor (ej. Mariposa, Rojo)', 
              type: 'string',
              validation: Rule => Rule.required()
            },
            { 
              name: 'image', 
              title: 'Foto / Miniatura', 
              type: 'image',
              options: { hotspot: true }
            },
            {
              name: 'stockCount',
              title: 'Cantidad en Stock',
              type: 'number',
              hidden: ({ document }) => document?.stockType !== 'finite',
              initialValue: 0
            },
            {
              name: 'isAvailable',
              title: '¿Está disponible?',
              type: 'boolean',
              hidden: ({ document }) => document?.stockType !== 'infinite',
              initialValue: true
            }
          ],
          preview: {
            select: {
              title: 'value',
              media: 'image',
              stockCount: 'stockCount',
              isAvailable: 'isAvailable',
              stockType: '^.stockType' // We can't access parent in preview easily, fallback to just showing title
            },
            prepare(selection) {
              const {title, media, stockCount, isAvailable} = selection;
              let subtitle = '';
              if (stockCount !== undefined) subtitle = `Stock: ${stockCount}`;
              else if (isAvailable !== undefined) subtitle = isAvailable ? 'Disponible' : 'Agotado';
              return {
                title,
                subtitle,
                media
              }
            }
          }
        }
      ]
    }
  ]
}
