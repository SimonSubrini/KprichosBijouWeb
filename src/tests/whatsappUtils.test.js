import { describe, it, expect } from 'vitest';
import { generateWhatsAppMessage } from '../utils/whatsappUtils';

describe('whatsappUtils', () => {
  it('should generate a correct message for a local pickup without discount', () => {
    const items = [
      {
        quantity: 2,
        product: { name: 'Aritos', basePrice: 1500 },
        customizations: 'Color: Rojo | Material: Plata'
      }
    ];
    const total = 3000;
    const discount = 0;
    const finalTotal = 3000;
    const shippingMethod = 'local';
    const formData = { name: 'Juan Perez' };

    const message = generateWhatsAppMessage(items, total, discount, finalTotal, shippingMethod, formData);

    expect(message).toContain('Hola Kprichos Bijou! Me gustaría realizar el siguiente pedido:');
    expect(message).toContain('- 2x Aritos ($3000)');
    expect(message).toContain('Personalización:');
    expect(message).toContain('- Color: Rojo');
    expect(message).toContain('- Material: Plata');
    expect(message).toContain('*Subtotal:* $3000');
    expect(message).toContain('*Total (sin envío):* $3000');
    expect(message).toContain('*Envío:* Retiro por local (Allen, Río Negro)');
    expect(message).toContain('*Nombre:* Juan Perez');
    expect(message).not.toContain('*Descuento Mayorista:*');
  });

  it('should generate a correct message for correo with discount and nested customizations', () => {
    const items = [
      {
        quantity: 1,
        product: { name: 'Llavero', basePrice: 5000 },
        waCustomizations: '↳ Dije Principal: Estrella\n↳ Accesorio: Ninguno'
      }
    ];
    const total = 5000;
    const discount = 500;
    const finalTotal = 4500;
    const shippingMethod = 'correo';
    const formData = { 
      name: 'Maria Gomez',
      province: 'Buenos Aires',
      city: 'La Plata',
      postalCode: '1900',
      street: 'Calle Falsa',
      number: '123',
      floor: '2B',
      phone: '2215555555',
      email: 'maria@example.com',
      observation: 'Timbre roto'
    };

    const message = generateWhatsAppMessage(items, total, discount, finalTotal, shippingMethod, formData);

    expect(message).toContain('- 1x Llavero ($5000)');
    expect(message).toContain('Personalización:\n↳ Dije Principal: Estrella\n↳ Accesorio: Ninguno');
    expect(message).toContain('*Subtotal:* $5000');
    expect(message).toContain('*Descuento Mayorista:* -$500');
    expect(message).toContain('*Total (sin envío):* $4500');
    expect(message).toContain('*Envío:* Correo Argentino');
    expect(message).toContain('*Provincia:* Buenos Aires');
    expect(message).toContain('*Dirección:* Calle Falsa 123 (Piso/Dpto: 2B)');
    expect(message).toContain('*Observación:* Timbre roto');
  });
});
