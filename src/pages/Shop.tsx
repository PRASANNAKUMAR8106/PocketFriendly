import React, { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { productsService, ProductFilters } from '../services/productsService';
import { categoriesService } from '../services/categoriesService';
import { Product, Category } from '../types';
import { formatINR } from '../utils/currency';

interface ContextType {
  onQuickView: (product: Product) => void;
}

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { onQuickView } = useOutletContext<ContextType>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read URL query params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sortParam = (searchParams.get('sort') as any) || 'newest';
  const fabricParam = searchParams.get('fabric') || '';
  const inStockParam = searchParams.get('inStock') === 'true';

  // Available Fabrics for filtering
  const availableFabrics = ['Silk Blend', 'Organza', 'Cotton', 'Georgette', 'Chanderi', 'Bandhani'];

  useEffect(() => {
    categoriesService.getCategories(true).then(setCategories);
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      const filters: ProductFilters = {
        categorySlug: categoryParam || undefined,
        search: searchParam || undefined,
        maxPrice: maxPriceParam,
        fabric: fabricParam || undefined,
        inStockOnly: inStockParam,
        sortBy: sortParam,
      };

      const res = await productsService.getProducts(filters);
      setProducts(res.products);
      setTotalCount(res.total);
      setLoading(false);
    };

    fetchCatalog();
  }, [categoryParam, searchParam, maxPriceParam, fabricParam, inStockParam, sortParam]);

  const updateFilter = (key: string, val: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val === null || val === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, val);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(categoryParam || searchParam || maxPriceParam || fabricParam || inStockParam);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <Link to="/" className="hover:text-maroon-800">Home</Link>
          <span>/</span>
          <span className="text-stone-800 font-semibold">Shop All Sarees</span>
          {categoryParam && (
            <>
              <span>/</span>
              <span className="text-maroon-800 font-bold capitalize">
                {categoryParam.replace(/-/g, ' ')}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              {categoryParam ? categoryParam.replace(/-/g, ' ').toUpperCase() : 'All Sarees Collection'}
            </h1>
            <p className="text-xs md:text-sm text-stone-500 mt-1">
              Showing {totalCount} authentic handcrafted sarees available for delivery across India.
            </p>
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 rounded-md text-xs font-semibold text-stone-800 bg-white shadow-sm"
            >
              <Filter className="w-4 h-4 text-maroon-800" /> Filters
            </button>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none px-3.5 py-2 pr-8 border border-stone-300 rounded-md text-xs font-semibold text-stone-800 bg-white focus:outline-none focus:border-maroon-800 shadow-sm cursor-pointer"
              >
                <option value="newest">Sort By: Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            <span className="text-xs text-stone-500 font-medium">Active Filters:</span>
            {categoryParam && (
              <span className="inline-flex items-center gap-1 text-xs bg-maroon-50 text-maroon-900 border border-maroon-200 px-2.5 py-1 rounded-full font-medium">
                Category: {categoryParam}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('category', null)} />
              </span>
            )}
            {searchParam && (
              <span className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-800 border border-stone-300 px-2.5 py-1 rounded-full font-medium">
                Search: "{searchParam}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('search', null)} />
              </span>
            )}
            {maxPriceParam && (
              <span className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-800 border border-stone-300 px-2.5 py-1 rounded-full font-medium">
                Under {formatINR(maxPriceParam)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('maxPrice', null)} />
              </span>
            )}
            {fabricParam && (
              <span className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-800 border border-stone-300 px-2.5 py-1 rounded-full font-medium">
                Fabric: {fabricParam}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('fabric', null)} />
              </span>
            )}
            {inStockParam && (
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                In Stock Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('inStock', null)} />
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-maroon-800 font-bold hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar + Product Cards */}
      <div className="flex gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-maroon-800" /> Filter Sarees
            </h3>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs text-maroon-800 font-medium hover:underline">
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">Category</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <label className="flex items-center gap-2 text-xs text-stone-600 hover:text-maroon-800 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={!categoryParam}
                  onChange={() => updateFilter('category', null)}
                  className="accent-maroon-800"
                />
                All Categories
              </label>
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs text-stone-600 hover:text-maroon-800 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryParam === c.slug}
                    onChange={() => updateFilter('category', c.slug)}
                    className="accent-maroon-800"
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">Price Budget</h4>
            <div className="space-y-1.5">
              {[
                { label: 'All Prices', max: null },
                { label: 'Under ₹1,500', max: '1500' },
                { label: 'Under ₹2,000', max: '2000' },
                { label: 'Under ₹3,000', max: '3000' },
              ].map((p) => (
                <label key={p.label} className="flex items-center gap-2 text-xs text-stone-600 hover:text-maroon-800 cursor-pointer">
                  <input
                    type="radio"
                    name="priceBudget"
                    checked={maxPriceParam?.toString() === p.max || (!maxPriceParam && !p.max)}
                    onChange={() => updateFilter('maxPrice', p.max)}
                    className="accent-maroon-800"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          {/* Fabric */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">Fabric</h4>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-stone-600 hover:text-maroon-800 cursor-pointer">
                <input
                  type="radio"
                  name="fabric"
                  checked={!fabricParam}
                  onChange={() => updateFilter('fabric', null)}
                  className="accent-maroon-800"
                />
                All Fabrics
              </label>
              {availableFabrics.map((f) => (
                <label key={f} className="flex items-center gap-2 text-xs text-stone-600 hover:text-maroon-800 cursor-pointer">
                  <input
                    type="radio"
                    name="fabric"
                    checked={fabricParam === f}
                    onChange={() => updateFilter('fabric', f)}
                    className="accent-maroon-800"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 text-xs text-stone-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                className="accent-maroon-800 rounded"
              />
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg skeleton-shimmer" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">
                No sarees found matching your criteria
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
                Try loosening your filters, changing fabrics, or clearing search keywords to view our complete collection.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-semibold rounded-md shadow-sm transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-5 shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="font-serif text-base font-bold text-stone-900">Filter Sarees</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Category</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    <label className="flex items-center gap-2 text-xs text-stone-600">
                      <input
                        type="radio"
                        name="m-cat"
                        checked={!categoryParam}
                        onChange={() => updateFilter('category', null)}
                      />
                      All Categories
                    </label>
                    {categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-xs text-stone-600">
                        <input
                          type="radio"
                          name="m-cat"
                          checked={categoryParam === c.slug}
                          onChange={() => updateFilter('category', c.slug)}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fabrics */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Fabric</h4>
                  <div className="space-y-1.5">
                    {availableFabrics.map((f) => (
                      <label key={f} className="flex items-center gap-2 text-xs text-stone-600">
                        <input
                          type="radio"
                          name="m-fab"
                          checked={fabricParam === f}
                          onChange={() => updateFilter('fabric', f)}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex gap-2">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2 text-xs font-semibold text-stone-700 border border-stone-300 rounded"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold bg-maroon-800 text-white rounded"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
