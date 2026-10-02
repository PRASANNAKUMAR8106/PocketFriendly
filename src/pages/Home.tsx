import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Award, ChevronRight, Star, Heart, Copy, Check } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { collectionsService } from '../services/collectionsService';
import { categoriesService } from '../services/categoriesService';
import { productsService } from '../services/productsService';
import { Product, Collection, Category } from '../types';
import { formatINR } from '../utils/currency';

interface ContextType {
  onQuickView: (product: Product) => void;
}

export const Home: React.FC = () => {
  const { settings } = useSettings();
  const { onQuickView } = useOutletContext<ContextType>();

  const [latestCollection, setLatestCollection] = useState<Collection | null>(null);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [budgetBestsellers, setBudgetBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCopied, setCouponCopied] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [latestData, cats, featuredData, bestData] = await Promise.all([
          collectionsService.getLatestCollection(),
          categoriesService.getCategories(true),
          productsService.getProducts({ isFeatured: true }),
          productsService.getProducts({ maxPrice: 1999 }),
        ]);

        setLatestCollection(latestData.collection);
        setLatestProducts(latestData.products);
        setCategories(cats);
        setFeaturedProducts(featuredData.products);
        setBudgetBestsellers(bestData.products);
      } catch (e) {
        console.error('Failed to load home page data', e);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-stone-900 overflow-hidden">
        {/* Background Image with warm gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings.hero_image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80'}
            alt="Handcrafted Indian Sarees"
            className="w-full h-full object-cover object-top opacity-55 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-900/80 border border-gold-500/30 text-gold-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Authentic Weaves • Weaver-Direct Pricing</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15]">
              {settings.hero_title}
            </h1>

            <p className="text-base sm:text-lg text-stone-300 font-light leading-relaxed max-w-xl">
              {settings.hero_subtitle}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                to={settings.hero_cta_link || '/collections/latest'}
                className="px-7 py-3.5 bg-maroon-800 hover:bg-maroon-900 text-white font-medium text-sm rounded-md shadow-lg shadow-maroon-950/50 hover:shadow-maroon-900/60 transition-all flex items-center gap-2.5 active:scale-95"
              >
                {settings.hero_cta_text || 'Explore Collection'}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/shop"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-md backdrop-blur-md border border-white/20 transition-all active:scale-95"
              >
                Browse All Sarees
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/10 text-stone-300 text-xs sm:text-sm">
              <div>
                <p className="font-serif font-bold text-lg sm:text-xl text-gold-400">10,000+</p>
                <p className="text-stone-400 text-xs">Happy Saree Lovers</p>
              </div>
              <div>
                <p className="font-serif font-bold text-lg sm:text-xl text-gold-400">100%</p>
                <p className="text-stone-400 text-xs">Pure Handloom Inspired</p>
              </div>
              <div>
                <p className="font-serif font-bold text-lg sm:text-xl text-gold-400">₹999+</p>
                <p className="text-stone-400 text-xs">Free All-India Shipping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LATEST COLLECTION SECTION (High Priority Requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-maroon-800 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-maroon-800 animate-pulse" />
              Admin Curated • Just Arrived
            </div>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-stone-900">
              {latestCollection?.title || 'The Royal Festive Collection'}
            </h2>
            <p className="text-xs md:text-sm text-stone-600 mt-1 max-w-xl">
              {latestCollection?.description || 'Handcrafted sarees adorned with rich zari pallus and jewel tones.'}
            </p>
          </div>

          <Link
            to="/collections/latest"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-maroon-800 hover:text-maroon-900 group"
          >
            <span>View Full Latest Collection</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Latest Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg skeleton-shimmer" />
            ))
          ) : latestProducts.length > 0 ? (
            latestProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-stone-500 text-sm">
              Latest collection will appear here. Manageable via Admin Dashboard.
            </div>
          )}
        </div>
      </section>

      {/* 3. CATEGORIES SHOWCASE */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-gold-700 font-bold">
              Heritage Weaves
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-stone-900 mt-1">
              Shop by Saree Category
            </h2>
            <p className="text-xs md:text-sm text-stone-600 mt-2">
              From heavy royal bridal Banarasi to breezy daily cottons, find the drape made for you.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-stone-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white flex flex-col justify-end">
                  <h3 className="font-serif text-base md:text-lg font-bold group-hover:text-gold-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-stone-300 font-medium inline-flex items-center gap-1 mt-0.5">
                    Explore Sarees <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BESTSELLERS UNDER ₹1,999 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-700 font-bold">
              Pocket-Friendly Edit
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-stone-900 mt-1">
              Bestsellers Under ₹1,999
            </h2>
            <p className="text-xs md:text-sm text-stone-600 mt-1">
              Uncompromised quality and elegance designed to fit every wardrobe budget.
            </p>
          </div>

          <Link
            to="/shop?maxPrice=1999"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-maroon-800 hover:text-maroon-900 group"
          >
            <span>View All Under ₹1,999</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {budgetBestsellers.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 5. EDITORIAL BRAND STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-stone-100 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-900/80 border border-gold-500/30 text-gold-300 text-xs font-semibold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-gold-400" />
              <span>Our Weaver Direct Promise</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              The Art of PocketFriendly: <br />
              <span className="text-gold-400 italic">Luxury Without Middlemen</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
              In traditional fashion retail, a genuine handloom saree passes through up to four intermediaries—each marking up the price by 30-50% before it ever touches your wardrobe.
            </p>
            <p className="text-sm text-stone-400 leading-relaxed">
              We partner directly with multigenerational master weavers across Varanasi, Kanchipuram, and Surat. By eliminating opulent showroom overheads and distributor layers, we bring bridal silks, festive brocades, and everyday cottons straight to your door at honest prices.
            </p>
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-stone-800 text-stone-300">
              <div>
                <p className="font-serif text-2xl font-bold text-gold-400">Zero</p>
                <p className="text-xs text-stone-400">Middlemen Markup</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-gold-400">500+</p>
                <p className="text-xs text-stone-400">Artisans Supported</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-gold-400">100%</p>
                <p className="text-xs text-stone-400">Pure Craft Integrity</p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-300 hover:text-white transition-colors"
              >
                Discover Our Heritage Chronicles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 h-full min-h-[380px] lg:min-h-[520px] relative">
            <img
              src="https://images.unsplash.com/photo-1610030469668-935a8df2a201?auto=format&fit=crop&w=1200&q=80"
              alt="Indian Handloom Loom Weaving"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-900 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-stone-950/85 backdrop-blur-md border border-stone-800 text-xs text-stone-300">
              <span className="font-semibold text-white">Authentic Shuttle Weaving:</span> Delicate antique zari buttas hand-shuttled into fine warp and weft by traditional Indian weavers.
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROMOTIONAL BANNER WITH 1-CLICK COPY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-maroon-900 via-maroon-800 to-stone-900 text-white p-8 md:p-12 shadow-2xl border border-gold-500/30">
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="px-3 py-1 bg-gold-500 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-md">
                Festive Welcome Offer
              </span>
              <span className="text-xs text-gold-300 font-medium">Limited Time Only</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
              Get Flat 10% OFF on Your First Order
            </h2>
            <p className="text-xs md:text-sm text-stone-200 leading-relaxed">
              Experience the grace of authentic Indian weaves without boutique markups. Use code <strong className="text-gold-300">WELCOME10</strong> at checkout on eligible orders above ₹1,499.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('WELCOME10');
                  setCouponCopied(true);
                  setTimeout(() => setCouponCopied(false), 2000);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-stone-950 hover:bg-black text-gold-300 border border-gold-500/40 font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all active:scale-95"
              >
                {couponCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied WELCOME10!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gold-400" />
                    <span>Copy Code: WELCOME10</span>
                  </>
                )}
              </button>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gold-50 text-maroon-900 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-95"
              >
                Shop Festive Sarees <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">100% Authentic</h4>
              <p className="text-[11px] text-stone-500">Genuine Handloom Weaves</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Free Shipping</h4>
              <p className="text-[11px] text-stone-500">All India on orders ₹999+</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">7-Day Easy Returns</h4>
              <p className="text-[11px] text-stone-500">Hassle-free return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Secure & COD</h4>
              <p className="text-[11px] text-stone-500">Cash on Delivery Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS */}
      <section className="bg-stone-50 py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-maroon-800 font-bold">
              Loved Across India
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-stone-900 mt-1">
              Words From Our Customers
            </h2>
            <div className="flex items-center justify-center gap-1 mt-2 text-gold-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-xs font-semibold text-stone-700 ml-2">4.9 / 5 Overall Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex text-gold-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h4 className="font-serif text-sm font-bold text-stone-900">
                “Felt like a boutique silk saree worth ₹10,000!”
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                The crimson Banarasi arrived beautifully packed in a cloth pouch. The zari shine is subtle and regal, not flashy. Wore it for Diwali puja and everyone asked where I bought it!
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">Priya K., Bangalore</span>
                <span className="text-[11px] text-emerald-700 font-medium">✓ Verified Buyer</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex text-gold-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h4 className="font-serif text-sm font-bold text-stone-900">
                “So soft and breathable organza”
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Usually organzas can be stiff and puffy, but the Sage Mint saree draped so gracefully. The scalloped embroidery is flawless. Thank you PocketFriendly!
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">Radhika M., Pune</span>
                <span className="text-[11px] text-emerald-700 font-medium">✓ Verified Buyer</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex text-gold-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h4 className="font-serif text-sm font-bold text-stone-900">
                “Fast delivery & exact color match”
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Placed order via Cash on Delivery, delivered in 3 days in Hyderabad. Color and zari border were 100% true to the website photos.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">Lavanya S., Hyderabad</span>
                <span className="text-[11px] text-emerald-700 font-medium">✓ Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-maroon-800 font-bold">Got Questions?</span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm">
            <h4 className="font-serif text-sm font-semibold text-stone-900">Do sarees include an unstitched blouse piece?</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Yes! All our sarees come with a running or contrast 0.8-meter unstitched blouse piece matching the design, unless stated otherwise in product specs.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm">
            <h4 className="font-serif text-sm font-semibold text-stone-900">Is Cash on Delivery (COD) available?</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Yes, Cash on Delivery is available across 19,000+ PIN codes in India. You can pay securely upon delivery.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm">
            <h4 className="font-serif text-sm font-semibold text-stone-900">What is the return policy?</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              We offer a straightforward 7-day return window from the day of delivery if the saree has any manufacturing defects or does not match the description.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/faq" className="text-xs text-maroon-800 font-semibold hover:underline">
            Read All Customer FAQs →
          </Link>
        </div>
      </section>
    </div>
  );
};
