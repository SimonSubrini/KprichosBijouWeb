export default {
  name: 'category',
  title: 'Categoría',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nombre',
      type: 'string',
    },
    {
      name: 'isArchived',
      title: 'Archivado (Oculto)',
      type: 'boolean',
      initialValue: false,
    }
  ]
}
