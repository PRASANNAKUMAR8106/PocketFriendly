import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatINR, getDiscountBadge } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', product_id: product.id, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', is_primary: true, display_order: 1 }];

  const primaryImage = images.find(img => img.is_primary) || images[0];
  const secondaryImage = images.length > 1 ? images[1] : primaryImage;

  const isFavorited = isInWishlist(product.id);
  const discountBadge = getDiscountBadge(product.original_price, product.final_price, product.discount_type, product.discount_value);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, 1);
    if (res.success) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-stone-100 transition-all duration-300 hover:shadow-card-hover hover:border-gold-subtle">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          {/* Primary Image */}
          <img
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || product.name}
            className={`h-full w-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
              images.length > 1 ? 'group-hover:opacity-0' : ''
            }`}
            loading="lazy"
          />
          {/* Secondary Hover Image */}
          {images.length > 1 && (
            <img
              src={secondaryImage.image_url}
              alt={secondaryImage.alt_text || product.name}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountBadge && (
            <span className="bg-maroon-800 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm tracking-wide uppercase">
              {discountBadge}
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-gold-500 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide uppercase">
              New
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide uppercase">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorited
              ? 'bg-maroon-800 text-white'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-maroon-800 shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button (Desktop hover) */}
        {onQuickView && (
          <button
            onClick={handleQuickView}
            className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-1.5 bg-white/90 hover:bg-white text-stone-800 hover:text-maroon-800 text-xs font-medium px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Fabric & Occasion Subtitle */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-stone-500 mb-1">
            <span className="truncate">{product.fabric}</span>
            {product.color && <span className="truncate ml-1">• {product.color}</span>}
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            className="font-serif text-sm md:text-base font-semibold text-stone-900 hover:text-maroon-800 line-clamp-2 transition-colors duration-200 mb-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-stone-100 mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base md:text-lg font-bold text-stone-900">
                {formatINR(product.final_price)}
              </span>
              {product.original_price > product.final_price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>
            {/* Low stock notice */}
            {product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold && (
              <span className="text-[10px] text-amber-700 font-medium">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center shrink-0 ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-maroon-800 text-white hover:bg-maroon-900 active:scale-95 shadow-sm'
            }`}
            title={isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
          >
            {addedAnimation ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
