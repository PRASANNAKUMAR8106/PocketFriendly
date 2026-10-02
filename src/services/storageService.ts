import { supabase, isSupabaseConfigured } from './supabase';

export type StorageBucket = 'product-images' | 'collections' | 'hero-images' | 'banners';

export const storageService = {
  async uploadImage(
    file: File,
    bucket: StorageBucket = 'product-images',
    folder: string = 'catalog'
  ): Promise<{ url: string; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return { url: data.publicUrl };
      } catch (err: any) {
        console.warn('Supabase storage upload failed:', err.message);
        return { url: '', error: err.message || 'Image upload failed' };
      }
    }

    // Local simulated upload using FileReader / DataURL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ url: e.target?.result as string || '' });
      };
      reader.onerror = () => {
        resolve({ url: '', error: 'Failed to read image file locally' });
      };
      reader.readAsDataURL(file);
    });
  },

  async deleteImage(filePath: string, bucket: StorageBucket = 'product-images'): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        return !error;
      } catch (e) {
        return false;
      }
    }
    return true;
  }
};
