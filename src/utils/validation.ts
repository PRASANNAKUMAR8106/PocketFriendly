import { z } from 'zod';

/**
 * Validates Indian 10-digit mobile number (starts with 6, 7, 8, 9)
 */
export const indianMobileRegex = /^[6-9]\d{9}$/;

/**
 * Validates Indian 6-digit Postal PIN Code
 */
export const indianPincodeRegex = /^[1-9][0-9]{5}$/;

export const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(indianMobileRegex, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),
  addressLine1: z.string().min(5, 'Flat/House No., Street address is required'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(indianPincodeRegex, 'Please enter a valid 6-digit Indian PIN code'),
  paymentMethod: z.enum(['cod', 'razorpay']),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().nullable().optional(),
  sku: z.string().min(3, 'SKU is required'),
  original_price: z.number().positive('Original price must be positive'),
  discount_type: z.enum(['none', 'percentage', 'fixed']),
  discount_value: z.number().min(0, 'Discount value cannot be negative'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  low_stock_threshold: z.number().int().min(0, 'Threshold must be >= 0'),
  product_status: z.enum(['active', 'draft', 'archived']),
  fabric: z.string().min(2, 'Fabric is required'),
  color: z.string().min(2, 'Color is required'),
  pattern: z.string().min(2, 'Pattern is required'),
  occasion: z.string().min(2, 'Occasion is required'),
  saree_length: z.string().default('5.5 Meters'),
  blouse_included: z.boolean().default(true),
  blouse_length: z.string().default('0.8 Meters'),
  care_instructions: z.string().optional(),
  shipping_info: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_latest_collection: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_sale: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
