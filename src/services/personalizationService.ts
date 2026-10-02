import { Product } from '../types';

export interface PersonalizationNudge {
  id: string;
  type: 'cart_abandoned' | 'low_stock' | 'wishlist_reminder' | 'welcome_offer';
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  badge?: string;
}

const STORAGE_KEYS = {
  RECENT_VIEWS: 'pfs_recent_views_v1',
  DISMISSED_NUDGES: 'pfs_dismissed_nudges_v1',
  LAST_NUDGE_TIME: 'pfs_last_nudge_timestamp',
};

export const personalizationService = {
  // Record a product view
  recordProductView: (product: Product) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECENT_VIEWS);
      const views: { id: string; name: string; fabric: string; image: string; stock: number; time: number }[] = raw
        ? JSON.parse(raw)
        : [];

      const primaryImg =
        product.images?.find((img) => img.is_primary)?.image_url ||
        product.images?.[0]?.image_url ||
        '';

      const filtered = views.filter((v) => v.id !== product.id);
      filtered.unshift({
        id: product.id,
        name: product.name,
        fabric: product.fabric,
        image: primaryImg,
        stock: product.stock_quantity,
        time: Date.now(),
      });

      // Keep up to 10 recent views
      localStorage.setItem(STORAGE_KEYS.RECENT_VIEWS, JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {
      console.warn('Personalization storage error:', e);
    }
  },

  // Get next contextual nudge
  getContextualNudge: (
    cartItemCount: number,
    cartFirstItemName?: string,
    cartFirstItemImage?: string,
    wishlistCount: number = 0,
    wishlistFirstItemName?: string,
    wishlistFirstItemImage?: string
  ): PersonalizationNudge | null => {
    try {
      // Check session dismissal
      const dismissedRaw = sessionStorage.getItem(STORAGE_KEYS.DISMISSED_NUDGES);
      const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];

      // 1. High-Intent Abandoned Cart Nudge
      if (cartItemCount > 0 && !dismissed.includes('cart_abandoned')) {
        return {
          id: 'cart_abandoned',
          type: 'cart_abandoned',
          title: 'Your Festive Bag Awaits ✨',
          message: cartFirstItemName
            ? `“${cartFirstItemName}” is waiting in your bag with Free Delivery.`
            : `You have ${cartItemCount} handcrafted sarees in your bag.`,
          ctaText: 'Complete Order',
          ctaLink: '/cart',
          imageUrl: cartFirstItemImage,
          badge: 'Cart Reserved',
        };
      }

      // 2. Low-Stock Urgency on Recently Viewed
      const rawViews = localStorage.getItem(STORAGE_KEYS.RECENT_VIEWS);
      if (rawViews) {
        const views = JSON.parse(rawViews);
        const lowStockItem = views.find((v: any) => v.stock > 0 && v.stock <= 5);
        if (lowStockItem && !dismissed.includes(`low_stock_${lowStockItem.id}`)) {
          return {
            id: `low_stock_${lowStockItem.id}`,
            type: 'low_stock',
            title: `Only ${lowStockItem.stock} Pieces Remaining! 🔥`,
            message: `Demand is high for ${lowStockItem.name}. Reserve your weave before it sells out.`,
            ctaText: 'View Saree',
            ctaLink: `/product/${lowStockItem.id}`,
            imageUrl: lowStockItem.image,
            badge: 'Fast Selling',
          };
        }
      }

      // 3. Wishlist Reminder Nudge
      if (wishlistCount > 0 && wishlistFirstItemName && !dismissed.includes('wishlist_reminder')) {
        return {
          id: 'wishlist_reminder',
          type: 'wishlist_reminder',
          title: 'Saved in Your Wishlist ❤️',
          message: `Ready to drape “${wishlistFirstItemName}”? Weaver stock is limited.`,
          ctaText: 'View Wishlist',
          ctaLink: '/wishlist',
          imageUrl: wishlistFirstItemImage,
          badge: 'Wishlist Item',
        };
      }

      // 4. Welcome Festive Promo Nudge (Default fallback if nothing dismissed)
      if (!dismissed.includes('welcome_offer')) {
        return {
          id: 'welcome_offer',
          type: 'welcome_offer',
          title: 'Special First Order Gift 🎁',
          message: 'Apply coupon WELCOME10 at checkout to unlock flat 10% OFF your collection!',
          ctaText: 'Explore Sarees',
          ctaLink: '/collections/latest',
          badge: '10% OFF Code',
        };
      }

      return null;
    } catch {
      return null;
    }
  },

  // Dismiss nudge for this session
  dismissNudge: (nudgeId: string) => {
    try {
      const dismissedRaw = sessionStorage.getItem(STORAGE_KEYS.DISMISSED_NUDGES);
      const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
      if (!dismissed.includes(nudgeId)) {
        dismissed.push(nudgeId);
        sessionStorage.setItem(STORAGE_KEYS.DISMISSED_NUDGES, JSON.stringify(dismissed));
      }
    } catch (e) {
      console.warn(e);
    }
  },
};
