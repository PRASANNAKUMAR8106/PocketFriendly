import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { SearchModal } from '../components/common/SearchModal';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { PersonalizationNudge } from '../components/common/PersonalizationNudge';
import { Product } from '../types';

export const CustomerLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      <main className="flex-1">
        {/* Pass down global quick view handler through outlet context if needed */}
        <Outlet context={{ onQuickView: (p: Product) => setQuickViewProduct(p) }} />
      </main>

      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <PersonalizationNudge />
    </div>
  );
};
