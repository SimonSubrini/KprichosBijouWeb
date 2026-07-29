import { describe, it, expect } from 'vitest';
import { getConsumedStock, getTrueMaxAllowed } from '../utils/stockUtils';

describe('Stock Validation Utilities', () => {
  it('should calculate consumed stock correctly for base products and accessories', () => {
    const cartItems = [
      {
        id: 'cart_1',
        quantity: 2,
        product: {
          _id: 'prod_A',
          type: 'stock',
          hasModels: false,
          accessorySelections: [
            { accessoryId: 'acc_1', optionValue: 'Rojo', stockType: 'finite' },
            { accessoryId: 'acc_2', optionValue: 'Azul', stockType: 'infinite' }
          ]
        }
      },
      {
        id: 'cart_2',
        quantity: 3,
        product: {
          _id: 'prod_A',
          type: 'stock',
          hasModels: false,
          accessorySelections: [
            { accessoryId: 'acc_1', optionValue: 'Rojo', stockType: 'finite' }
          ]
        }
      },
      {
        id: 'cart_3',
        quantity: 1,
        product: {
          _id: 'prod_B',
          type: 'stock',
          hasModels: true,
          selectedModel: 'Grande'
        }
      }
    ];

    const consumed = getConsumedStock(cartItems);

    expect(consumed['prod_A_base']).toBe(5); // 2 + 3
    expect(consumed['acc_acc_1_Rojo']).toBe(5); // 2 + 3
    expect(consumed['acc_acc_2_Azul']).toBeUndefined(); // infinite is not tracked
    expect(consumed['prod_B_model_Grande']).toBe(1);
  });

  it('should calculate getTrueMaxAllowed correctly', () => {
    const cartItems = [
      {
        id: 'cart_1',
        quantity: 4,
        product: {
          _id: 'prod_XYZ',
          type: 'stock',
          hasModels: false,
          accessorySelections: [
            { accessoryId: 'acc_555', optionValue: 'Mariposa', stockType: 'finite' }
          ]
        }
      }
    ];

    const newProduct = {
      _id: 'prod_XYZ',
      type: 'stock',
      stockCount: 10,
      hasModels: false
    };

    const newAccessorySelections = [
      { accessoryId: 'acc_555', optionValue: 'Mariposa', stockCount: 5, stockType: 'finite' }
    ];

    // Total prod_XYZ stock: 10. Consumed: 4. Remaining: 6.
    // Total acc_555_Mariposa stock: 5. Consumed: 4. Remaining: 1.
    // Max allowed should be the bottleneck: 1 (the accessory).

    const result = getTrueMaxAllowed(newProduct, null, newAccessorySelections, cartItems);

    expect(result.maxAllowed).toBe(1);
    expect(result.reason).toBe('el accesorio "Mariposa"');
  });

  it('should ignore excludeItemId to simulate adding units to an existing item', () => {
    const cartItems = [
      {
        id: 'cart_1',
        quantity: 2,
        product: {
          _id: 'prod_XYZ',
          type: 'stock',
          hasModels: false,
        }
      }
    ];

    const existingProduct = {
      _id: 'prod_XYZ',
      type: 'stock',
      stockCount: 10,
      hasModels: false
    };

    // If we are checking cart_1's max allowed, we exclude it from the consumed calculation
    const result = getTrueMaxAllowed(existingProduct, null, [], cartItems, 'cart_1');

    // Consumed by others: 0. Max limit: 10.
    expect(result.maxAllowed).toBe(10);
  });
});
