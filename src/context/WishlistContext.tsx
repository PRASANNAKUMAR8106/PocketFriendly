import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => { added: boolean };
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_WISHLIST_KEY = 'pfs_wishlist_items';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load wishlist from Supabase when user logs in
  useEffect(() => {
    if (user && isSupabaseConfigured) {
      supabase
        .from('wishlists')
        .select('product_id, products:products(*, images:product_images(*), category:categories(*))')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            const dbProducts = data.map((d: any) => d.products).filter(Boolean);
            if (dbProducts.length > 0) {
              setWishlist(dbProducts);
            }
          }
        });
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = isInWishlist(product.id);
    if (exists) {
      setWishlist(current => current.filter(p => p.id !== product.id));
      if (user && isSupabaseConfigured) {
        supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .then();
      }
      return { added: false };
    } else {
      setWishlist(current => [product, ...current]);
      if (user && isSupabaseConfigured) {
        supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: product.id })
          .then();
      }
      return { added: true };
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(current => current.filter(p => p.id !== productId));
    if (user && isSupabaseConfigured) {
      supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .then();
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (user && isSupabaseConfigured) {
      supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .then();
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
