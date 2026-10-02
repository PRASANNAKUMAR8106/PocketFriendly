import { supabase, isSupabaseConfigured } from './supabase';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from './mockData';

const LOCAL_STORAGE_CATEGORIES_KEY = 'pfs_categories_cache';

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local categories', e);
  }
  return INITIAL_CATEGORIES;
}

function saveLocalCategories(cats: Category[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Error saving local categories', e);
  }
}

export const categoriesService = {
  async getCategories(onlyActive = true): Promise<Category[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('categories').select('*').order('display_order', { ascending: true });
        if (onlyActive) q = q.eq('is_active', true);
        const { data, error } = await q;
        if (!error && data) return data as Category[];
      } catch (err) {
        console.warn('Supabase categories fetch failed, fallback', err);
      }
    }

    const local = getLocalCategories();
    return onlyActive ? local.filter(c => c.is_active) : local;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const list = await this.getCategories(false);
    return list.find(c => c.slug === slug) || null;
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cat.name || 'New Category',
      slug: cat.slug || `category-${Date.now()}`,
      description: cat.description || '',
      image_url: cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      display_order: cat.display_order || 99,
      is_active: cat.is_active ?? true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('categories').insert([newCat]).select().single();
        if (!error && data) return data as Category;
      } catch (err) {
        console.warn('Supabase category create failed', err);
      }
    }

    const current = getLocalCategories();
    const updated = [...current, newCat];
    saveLocalCategories(updated);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
        if (!error && data) return data as Category;
      } catch (err) {
        console.warn('Supabase category update failed', err);
      }
    }

    const current = getLocalCategories();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) return null;

    current[index] = { ...current[index], ...updates };
    saveLocalCategories(current);
    return current[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase category delete failed', err);
      }
    }

    const current = getLocalCategories();
    const updated = current.filter(c => c.id !== id);
    saveLocalCategories(updated);
    return true;
  }
};
