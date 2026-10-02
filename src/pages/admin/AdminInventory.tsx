import React, { useEffect, useState } from 'react';
import { Warehouse, Search, AlertTriangle, CheckCircle, Plus, Minus } from 'lucide-react';
import { productsService } from '../../services/productsService';
import { auditService } from '../../services/auditService';
import { Product } from '../../types';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { products: prods } = await productsService.getProducts();
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustStock = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.stock_quantity + delta);
    await productsService.updateStock(product.id, newQty);
    await auditService.logAction('ADJUST_STOCK', 'INVENTORY', product.id, {
      product: product.name,
      previous: product.stock_quantity,
      new: newQty,
      delta,
    });
    setProducts(current =>
      current.map(p => (p.id === product.id ? { ...p, stock_quantity: newQty } : p))
    );
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Warehouse & Stock Inventory
        </h1>
        <p className="text-xs text-stone-500">
          Monitor stock levels, set low stock thresholds, and update inventory counts.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by SKU or saree name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs focus:outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Saree / SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Threshold</th>
                <th className="p-3.5">Inventory Status</th>
                <th className="p-3.5 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((prod) => {
                const isOut = prod.stock_quantity <= 0;
                const isLow = prod.stock_quantity <= prod.low_stock_threshold && !isOut;

                return (
                  <tr key={prod.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-stone-900">{prod.name}</p>
                      <p className="text-[11px] font-mono text-stone-500">SKU: {prod.sku}</p>
                    </td>
                    <td className="p-3.5 text-stone-600">{prod.fabric}</td>
                    <td className="p-3.5 font-bold text-sm text-stone-900">
                      {prod.stock_quantity}
                    </td>
                    <td className="p-3.5 text-stone-500">{prod.low_stock_threshold}</td>
                    <td className="p-3.5">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(prod, -1)}
                          disabled={prod.stock_quantity <= 0}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded disabled:opacity-40"
                          title="Decrease 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(prod, 1)}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded"
                          title="Add 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(prod, 5)}
                          className="px-2 py-1 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 text-[10px] font-bold rounded"
                        >
                          +5 Batch
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
