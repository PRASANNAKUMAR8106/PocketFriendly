import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';

interface ContextType {
  onQuickView: (product: Product) => void;
}

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { onQuickView } = useOutletContext<ContextType>();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">Your Wishlist is Empty</h1>
        <p className="text-xs text-stone-500 mb-6">
          Save your favorite Banarasi, Kanjeevaram, and Organza sarees here to track them or purchase later!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-maroon-800 text-white rounded font-medium text-xs shadow hover:bg-maroon-900 transition-colors"
        >
          Explore Sarees <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Your saved handloom sarees ready to add to bag.
          </p>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs text-stone-500 hover:text-rose-600 transition-colors underline"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlist.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </div>
  );
};
