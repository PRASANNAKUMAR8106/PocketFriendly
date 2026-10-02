import { supabase, isSupabaseConfigured } from './supabase';
import { Product, ProductImage } from '../types';
import { INITIAL_PRODUCTS } from './mockData';

const LOCAL_STORAGE_PRODUCTS_KEY = 'pfs_products_cache';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local products', e);
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving local products', e);
  }
}

export interface ProductFilters {
  categorySlug?: string;
  collectionSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  fabric?: string;
  color?: string;
  occasion?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'discount';
  isFeatured?: boolean;
  isLatestCollection?: boolean;
  isNewArrival?: boolean;
  isSale?: boolean;
  inStockOnly?: boolean;
}

export const productsService = {
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('products')
          .select('*, images:product_images(*), category:categories(*)', { count: 'exact' });

        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,fabric.ilike.%${filters.search}%,color.ilike.%${filters.search}%`);
        }

        if (filters.isFeatured) query = query.eq('is_featured', true);
        if (filters.isLatestCollection) query = query.eq('is_latest_collection', true);
        if (filters.isNewArrival) query = query.eq('is_new_arrival', true);
        if (filters.isSale) query = query.eq('is_sale', true);
        if (filters.inStockOnly) query = query.gt('stock_quantity', 0);
        if (filters.minPrice !== undefined) query = query.gte('final_price', filters.minPrice);
        if (filters.maxPrice !== undefined) query = query.lte('final_price', filters.maxPrice);

        if (filters.sortBy === 'price-asc') query = query.order('final_price', { ascending: true });
        else if (filters.sortBy === 'price-desc') query = query.order('final_price', { ascending: false });
        else if (filters.sortBy === 'discount') query = query.order('discount_value', { ascending: false });
        else query = query.order('created_at', { ascending: false });

        const { data, count, error } = await query;
        if (!error && data) {
          return { products: data as Product[], total: count || data.length };
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to cached catalog', err);
      }
    }

    // Local / cached fallback logic
    let products = [...getLocalProducts()];

    if (filters.categorySlug) {
      products = products.filter(p => p.category?.slug === filters.categorySlug);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    if (filters.isFeatured) products = products.filter(p => p.is_featured);
    if (filters.isLatestCollection) products = products.filter(p => p.is_latest_collection);
    if (filters.isNewArrival) products = products.filter(p => p.is_new_arrival);
    if (filters.isSale) products = products.filter(p => p.is_sale);
    if (filters.inStockOnly) products = products.filter(p => p.stock_quantity > 0);
    if (filters.minPrice !== undefined) products = products.filter(p => p.final_price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) products = products.filter(p => p.final_price <= filters.maxPrice!);
    if (filters.fabric) products = products.filter(p => p.fabric.toLowerCase().includes(filters.fabric!.toLowerCase()));
    if (filters.color) products = products.filter(p => p.color.toLowerCase().includes(filters.color!.toLowerCase()));
    if (filters.occasion) products = products.filter(p => p.occasion.toLowerCase().includes(filters.occasion!.toLowerCase()));

    // Sorting
    if (filters.sortBy === 'price-asc') {
      products.sort((a, b) => a.final_price - b.final_price);
    } else if (filters.sortBy === 'price-desc') {
      products.sort((a, b) => b.final_price - a.final_price);
    } else if (filters.sortBy === 'discount') {
      products.sort((a, b) => {
        const da = a.original_price - a.final_price;
        const db = b.original_price - b.final_price;
        return db - da;
      });
    }

    return { products, total: products.length };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, images:product_images(*), category:categories(*)')
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Product;
      } catch (err) {
        console.warn('Supabase fetch failed, fallback', err);
      }
    }

    const local = getLocalProducts().find(p => p.slug === slug);
    return local || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, images:product_images(*), category:categories(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data as Product;
      } catch (err) {
        console.warn('Supabase fetch failed, fallback', err);
      }
    }

    const local = getLocalProducts().find(p => p.id === id);
    return local || null;
  },

  async getRelatedProducts(productId: string, categoryId?: string | null, limit: number = 4): Promise<Product[]> {
    const { products } = await this.getProducts({ inStockOnly: true });
    return products
      .filter(p => p.id !== productId && (!categoryId || p.category_id === categoryId))
      .slice(0, limit);
  },

  async createProduct(product: Partial<Product>, images: Array<{ image_url: string; alt_text?: string; is_primary?: boolean }>): Promise<Product> {
    const newId = `p-${Date.now()}`;
    const newProduct: Product = {
      id: newId,
      name: product.name || 'New Saree',
      slug: product.slug || `saree-${Date.now()}`,
      description: product.description || '',
      category_id: product.category_id || null,
      sku: product.sku || `PFS-${Date.now().toString().slice(-4)}`,
      original_price: Number(product.original_price) || 0,
      discount_type: product.discount_type || 'none',
      discount_value: Number(product.discount_value) || 0,
      final_price: Number(product.final_price) || Number(product.original_price) || 0,
      stock_quantity: Number(product.stock_quantity) || 0,
      low_stock_threshold: Number(product.low_stock_threshold) || 5,
      product_status: product.product_status || 'active',
      is_featured: Boolean(product.is_featured),
      is_latest_collection: Boolean(product.is_latest_collection),
      is_new_arrival: Boolean(product.is_new_arrival),
      is_sale: Boolean(product.is_sale),
      fabric: product.fabric || 'Silk Blend',
      color: product.color || 'Multicolor',
      pattern: product.pattern || 'Zari Woven',
      occasion: product.occasion || 'Festive',
      saree_length: product.saree_length || '5.5 Meters',
      blouse_included: product.blouse_included ?? true,
      blouse_length: product.blouse_length || '0.8 Meters',
      care_instructions: product.care_instructions || 'Dry clean recommended.',
      shipping_info: product.shipping_info || 'Dispatched within 24 hours.',
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      images: images.map((img, i) => ({
        id: `img-${Date.now()}-${i}`,
        product_id: newId,
        image_url: img.image_url,
        alt_text: img.alt_text || product.name || '',
        is_primary: img.is_primary ?? i === 0,
        display_order: i + 1,
      })),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('products').insert([
          {
            name: newProduct.name,
            slug: newProduct.slug,
            description: newProduct.description,
            category_id: newProduct.category_id,
            sku: newProduct.sku,
            original_price: newProduct.original_price,
            discount_type: newProduct.discount_type,
            discount_value: newProduct.discount_value,
            final_price: newProduct.final_price,
            stock_quantity: newProduct.stock_quantity,
            low_stock_threshold: newProduct.low_stock_threshold,
            product_status: newProduct.product_status,
            is_featured: newProduct.is_featured,
            is_latest_collection: newProduct.is_latest_collection,
            is_new_arrival: newProduct.is_new_arrival,
            is_sale: newProduct.is_sale,
            fabric: newProduct.fabric,
            color: newProduct.color,
            pattern: newProduct.pattern,
            occasion: newProduct.occasion,
            saree_length: newProduct.saree_length,
            blouse_included: newProduct.blouse_included,
            blouse_length: newProduct.blouse_length,
            care_instructions: newProduct.care_instructions,
            shipping_info: newProduct.shipping_info,
            seo_title: newProduct.seo_title,
            seo_description: newProduct.seo_description,
          }
        ]).select().single();

        if (!error && data) {
          if (images.length > 0) {
            await supabase.from('product_images').insert(
              images.map((img, i) => ({
                product_id: data.id,
                image_url: img.image_url,
                alt_text: img.alt_text,
                is_primary: img.is_primary ?? i === 0,
                display_order: i + 1,
              }))
            );
          }
          return data as Product;
        }
      } catch (err) {
        console.warn('Supabase product insert failed', err);
      }
    }

    const current = getLocalProducts();
    const updated = [newProduct, ...current];
    saveLocalProducts(updated);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Product;
      } catch (err) {
        console.warn('Supabase product update failed', err);
      }
    }

    const current = getLocalProducts();
    const index = current.findIndex(p => p.id === id);
    if (index === -1) return null;

    current[index] = { ...current[index], ...updates, updated_at: new Date().toISOString() };
    saveLocalProducts(current);
    return current[index];
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase product delete failed', err);
      }
    }

    const current = getLocalProducts();
    const updated = current.filter(p => p.id !== id);
    saveLocalProducts(updated);
    return true;
  },

  async updateStock(id: string, newQuantity: number): Promise<boolean> {
    return (await this.updateProduct(id, { stock_quantity: Math.max(0, newQuantity) })) !== null;
  }
};
