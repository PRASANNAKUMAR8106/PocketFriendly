import { supabase, isSupabaseConfigured } from './supabase';
import { SiteSettings } from '../types';
import { INITIAL_SETTINGS } from './mockData';

const LOCAL_STORAGE_SETTINGS_KEY = 'pfs_site_settings';

function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local settings', e);
  }
  return INITIAL_SETTINGS;
}

function saveLocalSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving local settings', e);
  }
}

export const settingsService = {
  async getSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
        if (!error && data) return data as SiteSettings;
      } catch (err) {
        console.warn('Supabase settings fetch failed, fallback', err);
      }
    }
    return getLocalSettings();
  },

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .update(updates)
          .eq('id', 1)
          .select()
          .single();
        if (!error && data) return data as SiteSettings;
      } catch (err) {
        console.warn('Supabase settings update failed', err);
      }
    }

    const current = getLocalSettings();
    const updated = { ...current, ...updates };
    saveLocalSettings(updated);
    return updated;
  }
};
