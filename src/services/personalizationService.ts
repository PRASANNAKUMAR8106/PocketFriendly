import { Product } from '../types';

export interface PersonalizationNudge {
  id: string;
  type: 'cart_abandoned' | 'wishlist_reminder';
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  badge?: string;
}

export const STORAGE_KEYS = {
  RECENT_VIEWS: 'pfs_recent_views_v1',
  DISMISSED_NUDGES: 'pfs_dismissed_nudges_v1',
  CART_REMINDER_COOLDOWN: 'pfs_last_cart_reminder_ts',
  CART_ACTIVITY_TS: 'pfs_cart_last_activity_ts',
  NOTIFICATIONS_DISABLED: 'pfs_notifications_disabled',
  LAST_ORDER_TS: 'pfs_last_order_ts',
};

// Abandoned cart eligibility timing rules
const ABANDONED_CART_DWELL_MS = 15 * 60 * 1000; // Cart must be inactive for >= 15 minutes
const ABANDONED_CART_COOLDOWN_MS = 24 * 60 * 60 * 1000; // Maximum once per 24 hours
const ORDER_COMPLETION_SUPPRESSION_MS = 2 * 60 * 60 * 1000; // Suppress for 2 hours after order

export const personalizationService = {
  // Check if customer explicitly opted out of marketing/nudge notifications
  isNotificationOptedOut: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_DISABLED) === 'true';
    } catch {
      return false;
    }
  },

  // Set user notification preferences
  setNotificationOptOut: (disabled: boolean) => {
    try {
      if (disabled) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_DISABLED, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS_DISABLED);
      }
    } catch (e) {
      console.warn('Failed to save notification preference:', e);
    }
  },

  // Record completed purchase to immediately suppress cart reminders
  recordOrderCompleted: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ORDER_TS, Date.now().toString());
      localStorage.removeItem(STORAGE_KEYS.CART_ACTIVITY_TS);
    } catch (e) {
      console.warn(e);
    }
  },

  // Record real product view
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

      localStorage.setItem(STORAGE_KEYS.RECENT_VIEWS, JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {
      console.warn('Personalization storage error:', e);
    }
  },

  // Check strict eligibility for an abandoned cart reminder
  isEligibleForAbandonedCartNudge: (cartItemCount: number): boolean => {
    if (cartItemCount <= 0) return false;

    try {
      // 1. Respect user opt-out preference
      if (localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_DISABLED) === 'true') {
        return false;
      }

      // 2. Check session dismissal
      const dismissedRaw = sessionStorage.getItem(STORAGE_KEYS.DISMISSED_NUDGES);
      const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
      if (dismissed.includes('cart_abandoned')) {
        return false;
      }

      // 3. Suppress if an order was completed recently
      const lastOrderTs = localStorage.getItem(STORAGE_KEYS.LAST_ORDER_TS);
      if (lastOrderTs) {
        const orderElapsed = Date.now() - Number(lastOrderTs);
        if (orderElapsed < ORDER_COMPLETION_SUPPRESSION_MS) {
          return false;
        }
      }

      // 4. Enforce 24-hour cooldown between abandoned cart nudges
      const lastNudgeTs = localStorage.getItem(STORAGE_KEYS.CART_REMINDER_COOLDOWN);
      if (lastNudgeTs) {
        const nudgeElapsed = Date.now() - Number(lastNudgeTs);
        if (nudgeElapsed < ABANDONED_CART_COOLDOWN_MS) {
          return false;
        }
      }

      // 5. Require genuine dwell/inactivity time (cart must be dormant for at least 15 minutes)
      const lastCartActivity = localStorage.getItem(STORAGE_KEYS.CART_ACTIVITY_TS);
      if (!lastCartActivity) {
        // No recorded cart activity timestamp — not a verified abandoned cart
        return false;
      }

      const activityElapsed = Date.now() - Number(lastCartActivity);
      if (activityElapsed < ABANDONED_CART_DWELL_MS) {
        // User was actively modifying the cart recently; do not interrupt active shopping
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  // Get next contextual nudge based strictly on genuine customer activity
  getContextualNudge: (
    cartItemCount: number,
    cartFirstItemName?: string,
    cartFirstItemImage?: string,
    wishlistCount: number = 0,
    wishlistFirstItemName?: string,
    wishlistFirstItemImage?: string
  ): PersonalizationNudge | null => {
    try {
      // 1. Genuine Abandoned Cart Nudge (requires verified dwell time and cooldown)
      if (personalizationService.isEligibleForAbandonedCartNudge(cartItemCount)) {
        // Record timestamp so 24h cooldown applies
        localStorage.setItem(STORAGE_KEYS.CART_REMINDER_COOLDOWN, Date.now().toString());

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
          badge: 'Saved in Bag',
        };
      }

      // 2. Genuine Wishlist Reminder (only if user explicitly saved items and hasn't dismissed)
      const dismissedRaw = sessionStorage.getItem(STORAGE_KEYS.DISMISSED_NUDGES);
      const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];

      if (
        wishlistCount > 0 &&
        wishlistFirstItemName &&
        !dismissed.includes('wishlist_reminder') &&
        localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_DISABLED) !== 'true'
      ) {
        return {
          id: 'wishlist_reminder',
          type: 'wishlist_reminder',
          title: 'Saved in Your Wishlist ❤️',
          message: `Ready to drape “${wishlistFirstItemName}”? Check out the latest festive details.`,
          ctaText: 'View Wishlist',
          ctaLink: '/wishlist',
          imageUrl: wishlistFirstItemImage,
          badge: 'Wishlist Item',
        };
      }

      // No fake low stock popups or fabricated promotional spam
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

  // Request browser push notification permission with explicit user gesture
  requestPushNotificationPermission: async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      return await Notification.requestPermission();
    } catch (e) {
      console.warn('Notification permission request failed:', e);
      return 'denied';
    }
  },
};
