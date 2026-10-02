import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, Edit2, Trash2, Check, X, Image as ImageIcon, ArrowUpDown } from 'lucide-react';
import { collectionsService } from '../../services/collectionsService';
import { productsService } from '../../services/productsService';
import { auditService } from '../../services/auditService';
import { Collection, Product } from '../../types';
import { slugify } from '../../utils/slugify';

export const AdminCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    banner_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    is_active: true,
    is_latest: false,
  });

  const loadData = async () => {
    setLoading(true);
    const [cols, { products }] = await Promise.all([
      collectionsService.getCollections(false),
      productsService.getProducts(),
    ]);
    setCollections(cols);
    setAllProducts(products);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCol(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      banner_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
      is_active: true,
      is_latest: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCol(col);
    setFormData({
      title: col.title,
      slug: col.slug,
      description: col.description || '',
      banner_image_url: col.banner_image_url || '',
      is_active: col.is_active,
      is_latest: col.is_latest,
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug && editingCol ? prev.slug : slugify(title),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingCol) {
      await collectionsService.updateCollection(editingCol.id, formData);
      await auditService.logAction('UPDATE_COLLECTION', 'COLLECTION', editingCol.id, { title: formData.title });
    } else {
      const created = await collectionsService.createCollection(formData);
      await auditService.logAction('CREATE_COLLECTION', 'COLLECTION', created.id, { title: formData.title });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      await collectionsService.deleteCollection(id);
      await auditService.logAction('DELETE_COLLECTION', 'COLLECTION', id);
      loadData();
    }
  };

  const handleToggleProductLatest = async (product: Product) => {
    const updatedStatus = !product.is_latest_collection;
    await productsService.updateProduct(product.id, { is_latest_collection: updatedStatus });
    await auditService.logAction('TOGGLE_PRODUCT_LATEST', 'PRODUCT', product.id, {
      product: product.name,
      is_latest_collection: updatedStatus,
    });
    loadData();
  };

  const latestCollectionProducts = allProducts.filter(p => p.is_latest_collection);

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Collection & Homepage Showcase Management
          </h1>
          <p className="text-xs text-stone-500">
            Control the active Latest Collection displayed prominently at the top of the homepage.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Collection
        </button>
      </div>

      {/* 1. LATEST COLLECTION SAREES MANAGER (Section 5 Requirement) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-maroon-800" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Active Homepage "Latest Collection" Sarees ({latestCollectionProducts.length})
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Select which sarees appear in the prominent top showcase on the customer homepage.
            </p>
          </div>
        </div>

        {/* Selected Sarees in Latest Collection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {latestCollectionProducts.map((p) => {
            const img = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
            return (
              <div key={p.id} className="relative bg-stone-50 border border-stone-200 rounded-lg p-2 flex flex-col justify-between group">
                <img src={img} alt="" className="w-full aspect-[3/4] object-cover rounded bg-white border border-stone-200 mb-2" />
                <p className="font-serif text-xs font-bold text-stone-900 truncate">{p.name}</p>
                <p className="text-[10px] text-stone-500 truncate">{p.fabric}</p>
                <button
                  onClick={() => handleToggleProductLatest(p)}
                  className="mt-2 w-full py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                >
                  Remove from Latest
                </button>
              </div>
            );
          })}
        </div>

        {/* Add more sarees dropdown / selector */}
        <div className="pt-4 border-t border-stone-100">
          <h4 className="text-xs font-bold text-stone-700 mb-2">Available Sarees to Add to Latest Collection:</h4>
          <div className="flex flex-wrap gap-2">
            {allProducts.filter(p => !p.is_latest_collection).map((p) => (
              <button
                key={p.id}
                onClick={() => handleToggleProductLatest(p)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-maroon-50 hover:border-maroon-300 border border-stone-200 rounded-lg text-xs text-stone-800 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-maroon-800" />
                <span className="truncate max-w-xs">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ALL COLLECTIONS TABLE */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <h3 className="font-serif text-base font-bold text-stone-900">
            All Collections
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Banner</th>
                <th className="p-3.5">Title & Description</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Homepage Active Latest</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3.5">
                    <img src={col.banner_image_url || ''} alt="" className="w-16 h-10 object-cover rounded border border-stone-200" />
                  </td>
                  <td className="p-3.5">
                    <p className="font-serif font-bold text-stone-900">{col.title}</p>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{col.description}</p>
                  </td>
                  <td className="p-3.5 font-mono text-stone-600">/{col.slug}</td>
                  <td className="p-3.5">
                    {col.is_latest ? (
                      <span className="bg-maroon-100 text-maroon-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ★ Active Latest
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      col.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {col.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(col)}
                        className="p-1.5 text-stone-500 hover:text-maroon-800 hover:bg-stone-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingCol ? 'Edit Collection' : 'Create Collection'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Collection Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Royal Utsav Collection"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.banner_image_url}
                  onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_latest}
                    onChange={(e) => setFormData({ ...formData, is_latest: e.target.checked })}
                    className="accent-maroon-800"
                  />
                  Set as Active "Latest Collection" (Displays on Homepage)
                </label>

                <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-maroon-800"
                  />
                  Collection Active & Published
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-lg shadow"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
