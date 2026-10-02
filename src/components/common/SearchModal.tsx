import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../../types';
import { productsService } from '../../services/productsService';
import { formatINR } from '../../utils/currency';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setLoading(true);
        const { products } = await productsService.getProducts({ search: searchTerm.trim() });
        setResults(products.slice(0, 6));
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    onClose();
    navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <form onSubmit={handleFullSearch} className="flex items-center border-b border-stone-200 px-4 py-3 bg-stone-50">
          <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by saree name, fabric (Banarasi, Organza), color, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm md:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 text-stone-400 hover:text-stone-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 text-stone-600 hover:bg-stone-200 rounded"
          >
            ESC
          </button>
        </form>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading && (
            <div className="py-8 text-center text-xs text-stone-500">
              Searching handloom sarees...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
                Matching Sarees ({results.length})
              </p>
              {results.map((product) => {
                const img = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    <img src={img} alt={product.name} className="w-12 h-16 object-cover rounded bg-stone-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-semibold text-stone-900 group-hover:text-maroon-800 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {product.fabric} • {product.color}
                      </p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xs font-bold text-stone-900">{formatINR(product.final_price)}</span>
                        {product.original_price > product.final_price && (
                          <span className="text-[11px] text-stone-400 line-through">
                            {formatINR(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-maroon-800 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}

              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  onClick={handleFullSearch}
                  className="text-xs font-semibold text-maroon-800 hover:underline"
                >
                  View all results for "{searchTerm}" →
                </button>
              </div>
            </div>
          )}

          {!loading && searchTerm.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center text-xs text-stone-500">
              No sarees found matching "{searchTerm}". Try searching "Banarasi", "Silk", "Crimson", or "Organza".
            </div>
          )}

          {!searchTerm && (
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3">
                Popular Saree Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Banarasi Silk', 'Kanjeevaram', 'Sage Green Organza', 'Chanderi', 'Crimson Red', 'Under ₹2,000'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-maroon-50 hover:text-maroon-800 text-stone-700 text-xs rounded-full transition-colors"
                  >
                    <Tag className="w-3 h-3 text-stone-400" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
