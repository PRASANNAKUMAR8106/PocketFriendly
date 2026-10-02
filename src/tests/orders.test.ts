import { describe, it, expect, beforeEach } from 'vitest';
import { ordersService } from '../services/ordersService';
import { productsService } from '../services/productsService';

describe('Order Creation & Inventory Synchronization', () => {
  beforeEach(() => {
    // Clear localStorage between test runs
    localStorage.clear();
  });

  it('successfully creates an order and decrements product inventory', async () => {
    const { products } = await productsService.getProducts();
    const productToBuy = products[0];
    const initialStock = productToBuy.stock_quantity;

    expect(initialStock).toBeGreaterThan(0);

    const orderRes = await ordersService.placeOrder({
      customerName: 'Priya Patel',
      customerEmail: 'priya@example.com',
      customerPhone: '9876543210',
      shippingAddress: {
        id: 'addr-1',
        full_name: 'Priya Patel',
        phone: '9876543210',
        address_line1: '124, Lotus Avenue',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395002',
        country: 'India',
      },
      items: [{ productId: productToBuy.id, quantity: 2 }],
      paymentMethod: 'cod',
    });

    expect(orderRes.success).toBe(true);
    expect(orderRes.order).toBeDefined();
    expect(orderRes.order?.order_number).toMatch(/^PFS-\d{8}-\w+$/);
    expect(orderRes.order?.items?.length).toBe(1);
    expect(orderRes.order?.items?.[0].quantity).toBe(2);

    // Verify inventory deduction
    const updatedProduct = await productsService.getProductById(productToBuy.id);
    expect(updatedProduct?.stock_quantity).toBe(initialStock - 2);
  });

  it('rejects an order if requested quantity exceeds available stock', async () => {
    const { products } = await productsService.getProducts();
    const product = products[0];

    const orderRes = await ordersService.placeOrder({
      customerName: 'Test Buyer',
      customerEmail: 'test@example.com',
      customerPhone: '9876543210',
      shippingAddress: {
        id: 'addr-1',
        full_name: 'Test Buyer',
        phone: '9876543210',
        address_line1: 'Street 1',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395002',
        country: 'India',
      },
      items: [{ productId: product.id, quantity: 999999 }], // Exceeds stock
      paymentMethod: 'cod',
    });

    expect(orderRes.success).toBe(false);
    expect(orderRes.error).toContain('Insufficient stock');
  });
});
