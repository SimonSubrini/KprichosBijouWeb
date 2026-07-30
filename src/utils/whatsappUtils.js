export function generateWhatsAppMessage(items, total, discount, finalTotal, shippingMethod, formData) {
  let message = "Hola Kprichos Bijou! Me gustaría realizar el siguiente pedido:\n\n";
  
  items.forEach(item => {
    message += `- ${item.quantity}x ${item.product.name} ($${item.product.basePrice * item.quantity})\n`;
    
    if (item.waCustomizations) {
      message += `  Personalización:\n${item.waCustomizations}\n`;
    } else if (item.customizations) {
      const customList = item.customizations.split(' | ').join('\n    - ');
      message += `  Personalización:\n    - ${customList}\n`;
    }
  });
  
  message += `\n*Subtotal:* $${total}\n`;
  if (discount > 0) {
    message += `*Descuento Mayorista:* -$${discount}\n`;
  }
  message += `*Total (sin envío):* $${finalTotal}\n\n`;

  if (shippingMethod === 'correo') {
    message += `*Envío:* Correo Argentino\n`;
    message += `*Nombre:* ${formData.name}\n`;
    message += `*Provincia:* ${formData.province}\n`;
    message += `*Localidad:* ${formData.city}\n`;
    message += `*C.P.:* ${formData.postalCode}\n`;
    message += `*Dirección:* ${formData.street} ${formData.number} ${formData.floor ? `(Piso/Dpto: ${formData.floor})` : ''}\n`;
    message += `*Teléfono:* ${formData.phone}\n`;
    message += `*Email:* ${formData.email}\n`;
    if (formData.observation) {
      message += `*Observación:* ${formData.observation}\n`;
    }
    message += `\n`;
  } else if (shippingMethod === 'local') {
    message += `*Envío:* Retiro por local (Allen, Río Negro)\n`;
    message += `*Nombre:* ${formData.name}\n\n`;
  }

  return message;
}
