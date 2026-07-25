export default {
  name: 'storeSettings',
  title: 'Configuración de la Tienda',
  type: 'document',
  fields: [
    {
      name: 'customOrdersSuspended',
      title: '¿Suspender toma de pedidos personalizados?',
      type: 'boolean',
      initialValue: false,
      description: 'Actívalo si estás saturada de trabajo y necesitas suspender temporalmente la toma de pedidos personalizados.'
    },
    {
      name: 'suspensionMessage',
      title: 'Mensaje de Aviso por Suspensión',
      type: 'text',
      description: 'Mensaje visible para el cliente donde indicas el motivo o fecha tentativa de regreso para la toma de pedidos personalizados.'
    }
  ]
};
