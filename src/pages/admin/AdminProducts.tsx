import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Star,
  Eye,
  Upload,
  AlertCircle
} from 'lucide-react';
import { productsService } from '../../services/productsService';
import { categoriesService } from '../../services/categoriesService';
import { storageService } from '../../services/storageService';
import { auditService } from '../../services/auditService';
import { Product, Category, DiscountType, ProductStatus } from '../../types';
import { formatINR } from '../../utils/currency';
import { slugify } from '../../utils/slugify';

export const AdminProducts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    sku: '',
    original_price: 2499,
    discount_type: 'percentage' as DiscountType,
    discount_value: 20,
    stock_quantity: 15,
    low_stock_threshold: 4,
    product_status: 'active' as ProductStatus,
    fabric: 'Banarasi Silk',
    color: 'Red',
    pattern: 'Zari Jaal',
    occasion: 'Wedding & Festive',
    saree_length: '5.5 Meters',
    blouse_included: true,
    blouse_length: '0.8 Meters',
    care_instructions: 'Dry clean only.',
    shipping_info: 'Dispatched within 24 hours.',
    is_featured: false,
    is_latest_collection: true,
    is_new_arrival: true,
    is_sale: false,
  });

  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      productsService.getProducts(),
      categoriesService.getCategories(false),
    ]);
    setProducts(prods.products);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      category_id: categories[0]?.id || '',
      sku: `PFS-${Math.floor(100 + Math.random() * 900)}`,
      original_price: 2499,
      discount_type: 'percentage',
      discount_value: 20,
      stock_quantity: 15,
      low_stock_threshold: 4,
      product_status: 'active',
      fabric: 'Banarasi Silk Blend',
      color: 'Royal Red',
      pattern: 'Traditional Floral Zari',
      occasion: 'Festive & Wedding',
      saree_length: '5.5 Meters',
      blouse_included: true,
      blouse_length: '0.8 Meters',
      care_instructions: 'Dry clean only.',
      shipping_info: 'Ships in 24 hours.',
      is_featured: false,
      is_latest_collection: true,
      is_new_arrival: true,
      is_sale: true,
    });
    setImageUrls(['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      category_id: p.category_id || categories[0]?.id || '',
      sku: p.sku,
      original_price: p.original_price,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold,
      product_status: p.product_status,
      fabric: p.fabric,
      color: p.color,
      pattern: p.pattern,
      occasion: p.occasion,
      saree_length: p.saree_length,
      blouse_included: p.blouse_included,
      blouse_length: p.blouse_length,
      care_instructions: p.care_instructions,
      shipping_info: p.shipping_info,
      is_featured: p.is_featured,
      is_latest_collection: p.is_latest_collection,
      is_new_arrival: p.is_new_arrival,
      is_sale: p.is_sale,
    });
    setImageUrls(p.images?.map(i => i.image_url) || [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    ]);
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug && editingProduct ? prev.slug : slugify(name),
    }));
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const res = await storageService.uploadImage(file, 'product-images', 'catalog');
    setUploadingImage(false);

    if (res.url) {
      setImageUrls(prev => [...prev, res.url]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Calculate final price accurately
    let final = formData.original_price;
    if (formData.discount_type === 'percentage') {
      final = Math.round(formData.original_price * (1 - formData.discount_value / 100) * 100) / 100;
    } else if (formData.discount_type === 'fixed') {
      final = Math.max(0, formData.original_price - formData.discount_value);
    }

    const payload: Partial<Product> = {
      ...formData,
      final_price: final,
    };

    const imageObjects = imageUrls.map((url, i) => ({
      image_url: url,
      alt_text: `${formData.name} - view ${i + 1}`,
      is_primary: i === 0,
    }));

    if (editingProduct) {
      await productsService.updateProduct(editingProduct.id, payload);
      await auditService.logAction('UPDATE_PRODUCT', 'PRODUCT', editingProduct.id, { name: formData.name });
    } else {
      const created = await productsService.createProduct(payload, imageObjects);
      await auditService.logAction('CREATE_PRODUCT', 'PRODUCT', created.id, { name: formData.name });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await productsService.deleteProduct(id);
    await auditService.logAction('DELETE_PRODUCT', 'PRODUCT', id);
    setDeleteConfirmId(null);
    loadData();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.fabric.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Saree Catalog Management
          </h1>
          <p className="text-xs text-stone-500">
            Manage saree specifications, prices, discounts, stock, and high-res photography.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Saree
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search saree by name, SKU, or fabric..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs focus:outline-none bg-transparent"
        />
        <span className="text-xs text-stone-400 font-medium">
          {filtered.length} Sarees
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Saree Details</th>
                <th className="p-3.5">SKU / Fabric</th>
                <th className="p-3.5">Pricing</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Badges</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((prod) => {
                const img = prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                return (
                  <tr key={prod.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={img} alt="" className="w-10 h-14 object-cover rounded bg-stone-100 border border-stone-200 shrink-0" />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{prod.name}</p>
                          <p className="text-[11px] text-stone-500">{prod.color} • {prod.occasion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-mono font-semibold text-stone-800">{prod.sku}</p>
                      <p className="text-[11px] text-stone-500">{prod.fabric}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-stone-900">{formatINR(prod.final_price)}</p>
                      {prod.original_price > prod.final_price && (
                        <p className="text-[11px] text-stone-400 line-through">{formatINR(prod.original_price)}</p>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        prod.stock_quantity <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : prod.stock_quantity <= prod.low_stock_threshold
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {prod.stock_quantity} in stock
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        prod.product_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {prod.product_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {prod.is_latest_collection && (
                          <span className="text-[9px] bg-maroon-100 text-maroon-800 font-bold px-1.5 py-0.5 rounded">Latest</span>
                        )}
                        {prod.is_featured && (
                          <span className="text-[9px] bg-gold-100 text-gold-900 font-bold px-1.5 py-0.5 rounded">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-stone-500 hover:text-maroon-800 hover:bg-stone-100 rounded"
                          title="Edit Saree"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prod.id)}
                          className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded"
                          title="Delete Saree"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xl max-w-sm w-full space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-900">Confirm Saree Deletion</h3>
            <p className="text-xs text-stone-500">
              Are you sure you want to delete this saree? Historical order snapshots will remain intact.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold border border-stone-300 rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow"
              >
                Delete Saree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Saree Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 my-8 p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {editingProduct ? 'Edit Saree Specification' : 'Add New Saree to Catalog'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Saree Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Royal Wine Banarasi Katan Silk Saree"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800 uppercase font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe weave, border, zari work, and draping feel..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                </div>
              </div>

              {/* Pricing & Discounts */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as DiscountType })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800 bg-white"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Calculated Customer Price</label>
                  <div className="px-3 py-2 bg-stone-200 rounded-lg font-bold text-maroon-800 text-sm">
                    {formatINR(
                      formData.discount_type === 'percentage'
                        ? formData.original_price * (1 - formData.discount_value / 100)
                        : Math.max(0, formData.original_price - formData.discount_value)
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Product Status</label>
                  <select
                    value={formData.product_status}
                    onChange={(e) => setFormData({ ...formData, product_status: e.target.value as ProductStatus })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Fabric Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fabric *</label>
                  <input
                    type="text"
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Color *</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pattern</label>
                  <input
                    type="text"
                    value={formData.pattern}
                    onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Occasion</label>
                  <input
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Checkboxes: Latest Collection, Featured */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_latest_collection}
                    onChange={(e) => setFormData({ ...formData, is_latest_collection: e.target.checked })}
                    className="accent-maroon-800"
                  />
                  Show in Homepage "Latest Collection"
                </label>
                <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-maroon-800"
                  />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="accent-maroon-800"
                  />
                  Mark as New Arrival
                </label>
              </div>

              {/* Image Manager */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-800">Saree Photography ({imageUrls.length} images)</label>
                  <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative w-20 h-28 rounded-lg overflow-hidden border border-stone-200 group shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-maroon-800 text-white text-[9px] text-center font-bold py-0.5">
                          Primary
                        </span>
                      )}
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-lg shadow-md transition-all"
                >
                  {editingProduct ? 'Save Saree Changes' : 'Create Saree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
