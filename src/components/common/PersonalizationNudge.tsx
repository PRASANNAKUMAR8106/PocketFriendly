import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { X, Sparkles, ArrowRight, ShoppingBag, Heart, Flame } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { personalizationService, PersonalizationNudge as NudgeType } from '../../services/personalizationService';

export const PersonalizationNudge: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, itemCount, setIsCartOpen } = useCart();
  const { wishlist, wishlistCount } = useWishlist();

  const [nudge, setNudge] = useState<NudgeType | null>(null);
  const [visible, setVisible] = useState(false);

  // Do not show on admin or checkout pages
  const isHiddenRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/checkout' ||
    location.pathname === '/order-confirmation';

  useEffect(() => {
    if (isHiddenRoute) {
      setVisible(false);
      return;
    }

    // Delay 5 seconds before showing smart nudge for smooth user onboarding
    const timer = setTimeout(() => {
      const firstCartItem = items[0];
      const firstCartItemImg =
        firstCartItem?.product.images?.find((img) => img.is_primary)?.image_url ||
        firstCartItem?.product.images?.[0]?.image_url;

      const firstWishlistItem = wishlist[0];
      const firstWishlistItemImg =
        firstWishlistItem?.images?.find((img) => img.is_primary)?.image_url ||
        firstWishlistItem?.images?.[0]?.image_url;

      const generatedNudge = personalizationService.getContextualNudge(
        itemCount,
        firstCartItem?.product.name,
        firstCartItemImg,
        wishlistCount,
        firstWishlistItem?.name,
        firstWishlistItemImg
      );

      if (generatedNudge) {
        setNudge(generatedNudge);
        setVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [location.pathname, itemCount, wishlistCount, isHiddenRoute]);

  const handleDismiss = () => {
    if (nudge) {
      personalizationService.dismissNudge(nudge.id);
    }
    setVisible(false);
  };

  const handleAction = () => {
    if (!nudge) return;
    handleDismiss();

    if (nudge.type === 'cart_abandoned') {
      setIsCartOpen(true);
    } else {
      navigate(nudge.ctaLink);
    }
  };

  if (isHiddenRoute || !visible || !nudge) return null;

  const getIcon = () => {
    switch (nudge.type) {
      case 'cart_abandoned':
        return <ShoppingBag className="w-4 h-4 text-maroon-800" />;
      case 'low_stock':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'wishlist_reminder':
        return <Heart className="w-4 h-4 text-maroon-800 fill-maroon-800" />;
      default:
        return <Sparkles className="w-4 h-4 text-gold-600" />;
    }
  };

  return (
    <aside
      aria-label="Personalized suggestion"
      className="fixed bottom-5 left-5 z-40 max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        {nudge.imageUrl ? (
          <div className="w-14 h-18 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/80 shrink-0">
            <img
              src={nudge.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-maroon-50 border border-maroon-200/60 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            {nudge.badge && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-maroon-800 bg-maroon-50 border border-maroon-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                {getIcon()} {nudge.badge}
              </span>
            )}
            <button
              onClick={handleDismiss}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors ml-auto"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="font-serif text-xs font-bold text-stone-900 mt-1 line-clamp-1">
            {nudge.title}
          </h4>

          <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
            {nudge.message}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleAction}
              className="px-3 py-1.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              {nudge.ctaText} <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleDismiss}
              className="px-2 py-1.5 text-stone-500 hover:text-stone-800 text-[11px] font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
