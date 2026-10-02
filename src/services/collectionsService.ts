import { supabase, isSupabaseConfigured } from './supabase';
import { Collection, Product } from '../types';
import { INITIAL_COLLECTIONS } from './mockData';
import { productsService } from './productsService';

const LOCAL_STORAGE_COLLECTIONS_KEY = 'pfs_collections_cache';

function getLocalCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local collections', e);
  }
  return INITIAL_COLLECTIONS;
}

function saveLocalCollections(cols: Collection[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_COLLECTIONS_KEY, JSON.stringify(cols));
  } catch (e) {
    console.error('Error saving local collections', e);
  }
}

export const collectionsService = {
  async getCollections(onlyActive = true): Promise<Collection[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('collections').select('*').order('display_order', { ascending: true });
        if (onlyActive) q = q.eq('is_active', true);
        const { data, error } = await q;
        if (!error && data) return data as Collection[];
      } catch (err) {
        console.warn('Supabase collections fetch failed, fallback', err);
      }
    }

    const local = getLocalCollections();
    return onlyActive ? local.filter(c => c.is_active) : local;
  },

  async getLatestCollection(): Promise<{ collection: Collection | null; products: Product[] }> {
    const collections = await this.getCollections(true);
    const latest = collections.find(c => c.is_latest) || collections[0] || null;

    // Fetch active latest collection products
    const { products } = await productsService.getProducts({
      isLatestCollection: true,
      inStockOnly: false,
    });

    return {
      collection: latest,
      products,
    };
  },

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    const list = await this.getCollections(false);
    return list.find(c => c.slug === slug) || null;
  },

  async createCollection(col: Partial<Collection>): Promise<Collection> {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      title: col.title || 'New Collection',
      slug: col.slug || `collection-${Date.now()}`,
      description: col.description || '',
      banner_image_url: col.banner_image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
      is_active: col.is_active ?? true,
      is_latest: col.is_latest ?? false,
      start_date: col.start_date || null,
      end_date: col.end_date || null,
      display_order: col.display_order || 99,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('collections').insert([newCol]).select().single();
        if (!error && data) return data as Collection;
      } catch (err) {
        console.warn('Supabase collection create failed', err);
      }
    }

    const current = getLocalCollections();
    // If marked as latest, unmark others
    if (newCol.is_latest) {
      current.forEach(c => c.is_latest = false);
    }
    const updated = [...current, newCol];
    saveLocalCollections(updated);
    return newCol;
  },

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('collections').update(updates).eq('id', id).select().single();
        if (!error && data) return data as Collection;
      } catch (err) {
        console.warn('Supabase collection update failed', err);
      }
    }

    const current = getLocalCollections();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) return null;

    if (updates.is_latest) {
      current.forEach(c => c.is_latest = false);
    }

    current[index] = { ...current[index], ...updates };
    saveLocalCollections(current);
    return current[index];
  },

  async deleteCollection(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('collections').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase collection delete failed', err);
      }
    }

    const current = getLocalCollections();
    const updated = current.filter(c => c.id !== id);
    saveLocalCollections(updated);
    return true;
  }
};
