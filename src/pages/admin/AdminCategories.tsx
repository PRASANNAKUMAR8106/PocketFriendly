import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { categoriesService } from '../../services/categoriesService';
import { auditService } from '../../services/auditService';
import { Category } from '../../types';
import { slugify } from '../../utils/slugify';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    display_order: 1,
    is_active: true,
  });

  const loadCategories = async () => {
    setLoading(true);
    const data = await categoriesService.getCategories(false);
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      display_order: categories.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order,
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug && editingCategory ? prev.slug : slugify(name),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      await categoriesService.updateCategory(editingCategory.id, formData);
      await auditService.logAction('UPDATE_CATEGORY', 'CATEGORY', editingCategory.id, { name: formData.name });
    } else {
      const created = await categoriesService.createCategory(formData);
      await auditService.logAction('CREATE_CATEGORY', 'CATEGORY', created.id, { name: formData.name });
    }

    setIsModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this category? Sarees assigned to it will remain safe.')) {
      await categoriesService.deleteCategory(id);
      await auditService.logAction('DELETE_CATEGORY', 'CATEGORY', id);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Saree Categories
          </h1>
          <p className="text-xs text-stone-500">
            Organize the storefront into Banarasi, Kanjeevaram, Organza, Chanderi, and more.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Image</th>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3.5">
                    <img src={cat.image_url || ''} alt="" className="w-12 h-14 object-cover rounded bg-stone-100 border border-stone-200" />
                  </td>
                  <td className="p-3.5">
                    <p className="font-serif font-bold text-stone-900">{cat.name}</p>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{cat.description}</p>
                  </td>
                  <td className="p-3.5 font-mono text-stone-600">/{cat.slug}</td>
                  <td className="p-3.5 font-bold text-stone-700">{cat.display_order}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {cat.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-stone-500 hover:text-maroon-800 hover:bg-stone-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Banarasi Silk"
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
                <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
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

              <div className="pt-2">
                <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-maroon-800"
                  />
                  Active Category
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
