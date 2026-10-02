import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Share2, Check, ArrowRight, Star, AlertCircle } from 'lucide-react';
import { productsService } from '../services/productsService';
import { Product } from '../types';
import { formatINR, getDiscountBadge } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { personalizationService } from '../services/personalizationService';

interface ContextType {
  onQuickView: (product: Product) => void;
}

const LOCAL_STORAGE_RECENT_KEY = 'pfs_recently_viewed_ids';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { onQuickView } = useOutletContext<ContextType>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        const prod = await productsService.getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          setSelectedImageIndex(0);
          setQuantity(1);
          personalizationService.recordProductView(prod);

          // Record in recently viewed
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
            const list: string[] = raw ? JSON.parse(raw) : [];
            const filtered = [prod.id, ...list.filter(id => id !== prod.id)].slice(0, 6);
            localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(filtered));

            // Load related products
            const related = await productsService.getRelatedProducts(prod.id, prod.category_id, 4);
            setRelatedProducts(related);

            // Load recently viewed products
            const { products: allProds } = await productsService.getProducts();
            const recents = filtered
              .filter(id => id !== prod.id)
              .map(id => allProds.find(p => p.id === id))
              .filter(Boolean) as Product[];
            setRecentlyViewed(recents.slice(0, 4));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[3/4] rounded-xl skeleton-shimmer" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 rounded skeleton-shimmer" />
            <div className="h-10 w-3/4 rounded skeleton-shimmer" />
            <div className="h-8 w-1/4 rounded skeleton-shimmer" />
            <div className="h-32 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Saree Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">
          The saree you are looking for might have been sold out, archived, or the link has changed.
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-maroon-800 text-white rounded font-medium text-xs shadow hover:bg-maroon-900 transition-colors"
        >
          Explore All Available Sarees
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: '1', product_id: product.id, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', is_primary: true, display_order: 1 }];

  const currentImage = images[selectedImageIndex] || images[0];
  const isFavorited = isInWishlist(product.id);
  const discountBadge = getDiscountBadge(product.original_price, product.final_price, product.discount_type, product.discount_value);
  const isOutOfStock = product.stock_quantity <= 0;
  const savingsAmount = product.original_price - product.final_price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  // Structured Data JSON-LD for Technical SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: currentImage.image_url,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'PocketFriendly Sarees',
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: 'INR',
      price: product.final_price,
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <Link to="/" className="hover:text-maroon-800">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-maroon-800">Shop Sarees</Link>
        <span>/</span>
        <span className="text-stone-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
          {/* Vertical Thumbnails on Desktop */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[600px] shrink-0 pb-2 md:pb-0">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-md overflow-hidden border transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-maroon-800 ring-2 ring-maroon-800/30'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Display Image */}
          <div className="relative flex-1 aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm group">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {discountBadge && (
              <span className="absolute top-4 left-4 bg-maroon-800 text-white text-xs font-bold px-3 py-1 rounded shadow-md tracking-wider uppercase">
                {discountBadge}
              </span>
            )}
            {product.is_new_arrival && (
              <span className="absolute top-4 right-4 bg-gold-500 text-stone-900 text-xs font-bold px-3 py-1 rounded shadow-md tracking-wider uppercase">
                New Arrival
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Actions (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-gold-700 font-semibold mb-1">
              <span>{product.fabric}</span>
              <span className="text-stone-400">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars Review Strip */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-stone-500 font-medium">4.9 (42 Verified Reviews)</span>
            </div>
          </div>

          {/* Pricing Hierarchy */}
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-stone-900">
                {formatINR(product.final_price)}
              </span>
              {product.original_price > product.final_price && (
                <span className="text-base text-stone-400 line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
              {discountBadge && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {discountBadge}
                </span>
              )}
            </div>
            {savingsAmount > 0 && (
              <p className="text-xs text-emerald-700 font-semibold">
                You save {formatINR(savingsAmount)} on this purchase!
              </p>
            )}
            <p className="text-[11px] text-stone-500">
              Inclusive of all taxes • Free shipping on orders above ₹999
            </p>
          </div>

          {/* Stock Status & Quantity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Availability:</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold">Currently Out of Stock</span>
              ) : product.stock_quantity <= product.low_stock_threshold ? (
                <span className="text-amber-700 font-bold">
                  ⚠️ Only {product.stock_quantity} left in stock - order soon!
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">In Stock & Ready to Dispatch</span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-stone-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 hover:bg-black text-white shadow-md active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Shopping Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-lg border transition-all ${
                  isFavorited
                    ? 'bg-maroon-50 border-maroon-300 text-maroon-800'
                    : 'border-stone-300 hover:border-maroon-800 text-stone-700'
                }`}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-maroon-800' : ''}`} />
              </button>
            </div>

            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-maroon-950/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                Buy Now <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Value Propositions / Trust */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-stone-200 text-[11px] text-stone-600 text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-maroon-800" />
              <span>Free Delivery Above ₹999</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-maroon-800" />
              <span>7 Days Easy Return</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-maroon-800" />
              <span>COD & 100% Genuine</span>
            </div>
          </div>

          {/* Saree Specification Tabs */}
          <div className="pt-2">
            <div className="flex border-b border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-maroon-800 text-maroon-800' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Saree Details
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'care' ? 'border-maroon-800 text-maroon-800' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Fabric & Care
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'shipping' ? 'border-maroon-800 text-maroon-800' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Shipping & Delivery
              </button>
            </div>

            <div className="py-4 text-xs text-stone-600 leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded border border-stone-200 mt-2">
                    <div><span className="text-stone-400">Fabric:</span> <strong className="text-stone-800">{product.fabric}</strong></div>
                    <div><span className="text-stone-400">Color:</span> <strong className="text-stone-800">{product.color}</strong></div>
                    <div><span className="text-stone-400">Pattern:</span> <strong className="text-stone-800">{product.pattern}</strong></div>
                    <div><span className="text-stone-400">Occasion:</span> <strong className="text-stone-800">{product.occasion}</strong></div>
                    <div><span className="text-stone-400">Saree Length:</span> <strong className="text-stone-800">{product.saree_length}</strong></div>
                    <div><span className="text-stone-400">Blouse Piece:</span> <strong className="text-stone-800">{product.blouse_included ? `Included (${product.blouse_length})` : 'Not Included'}</strong></div>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-2">
                  <p><strong>Care Instructions:</strong> {product.care_instructions}</p>
                  <p className="text-stone-500">
                    Always store precious silk and zari sarees folded in pure muslin or cotton cloths to maintain the lustrous shine of the threads. Avoid spraying perfume directly onto the zari work.
                  </p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-2">
                  <p><strong>Dispatch Information:</strong> {product.shipping_info}</p>
                  <p className="text-stone-500">
                    • Metro Cities: Delivered within 2-3 business days.<br/>
                    • Rest of India: Delivered within 4-6 business days.<br/>
                    • Tracking link shared instantly via SMS & Email upon shipment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-stone-200">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">
            You May Also Adore
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Sarees Section */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16 pt-8 border-t border-stone-200">
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-6">
            Recently Viewed Sarees
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
