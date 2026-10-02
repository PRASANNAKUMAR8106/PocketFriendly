import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../../types';
import { formatINR, getDiscountBadge } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: '1', product_id: product.id, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', is_primary: true, display_order: 1 }];

  const currentImg = images[selectedImageIndex] || images[0];
  const isFavorited = isInWishlist(product.id);
  const discountBadge = getDiscountBadge(product.original_price, product.final_price, product.discount_type, product.discount_value);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-stone-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="md:w-1/2 p-4 flex flex-col items-center justify-center bg-stone-50">
          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone-200 shadow-sm bg-white">
            <img
              src={currentImg.image_url}
              alt={currentImg.alt_text || product.name}
              className="w-full h-full object-cover"
            />
            {discountBadge && (
              <span className="absolute top-2.5 left-2.5 bg-maroon-800 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm">
                {discountBadge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto max-w-full pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-16 rounded border overflow-hidden shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-maroon-800 ring-2 ring-maroon-800/20' : 'border-stone-200 opacity-70'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gold-700 font-semibold">
              {product.fabric} • SKU: {product.sku}
            </span>
            <h2 className="font-serif text-xl font-bold text-stone-900 mt-1 mb-2">
              {product.name}
            </h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 my-3">
              <span className="text-2xl font-bold text-maroon-800">
                {formatINR(product.final_price)}
              </span>
              {product.original_price > product.final_price && (
                <span className="text-stone-400 line-through text-base">
                  {formatINR(product.original_price)}
                </span>
              )}
              {discountBadge && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Save {formatINR(product.original_price - product.final_price)}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-lg border border-stone-200 mb-4">
              <div><span className="text-stone-500">Color:</span> <span className="font-medium text-stone-800">{product.color}</span></div>
              <div><span className="text-stone-500">Occasion:</span> <span className="font-medium text-stone-800">{product.occasion}</span></div>
              <div><span className="text-stone-500">Length:</span> <span className="font-medium text-stone-800">{product.saree_length}</span></div>
              <div><span className="text-stone-500">Blouse:</span> <span className="font-medium text-stone-800">{product.blouse_included ? 'Included (0.8m)' : 'Not Included'}</span></div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-200 rounded-md overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold text-stone-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-stone-500">
                  ({product.stock_quantity} available)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-maroon-800 hover:bg-maroon-900 text-white shadow-md active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-lg border transition-all ${
                  isFavorited
                    ? 'bg-maroon-50 border-maroon-300 text-maroon-800'
                    : 'border-stone-200 hover:border-maroon-800 text-stone-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-maroon-800' : ''}`} />
              </button>
            </div>

            {/* View Full Product Details Link */}
            <div className="mt-3 text-center">
              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="text-xs text-maroon-800 hover:underline font-semibold"
              >
                View Complete Saree Details & Fabric Care →
              </Link>
            </div>

            {/* Quick Guarantees */}
            <div className="flex items-center justify-around pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-500">
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-stone-600" /> Free Shipping ₹999+
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-600" /> Direct from Weavers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
