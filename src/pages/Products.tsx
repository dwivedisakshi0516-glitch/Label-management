import React, { useState, useEffect } from 'react';
import { Box, Plus, Search, Edit2, Trash2, Eye, X, Filter, Check, IndianRupee } from 'lucide-react';
import { Product, Category, Manufacturer, CustomerCare, Warranty } from '../types';
import { productsApi, categoriesApi, manufacturersApi, customerCareApi, warrantiesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { DeleteModal } from '../components/common/DeleteModal';

export const Products: React.FC = () => {
  const toast = useToast();
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [customerCareList, setCustomerCareList] = useState<CustomerCare[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // View Modal
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [productNumber, setProductNumber] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [customerCareId, setCustomerCareId] = useState('');
  const [warrantyId, setWarrantyId] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState(settings.default_country);
  const [genericName, setGenericName] = useState('');
  const [netQuantity, setNetQuantity] = useState('1 N');
  const [defaultMrp, setDefaultMrp] = useState<number | string>(0);
  const [taxText, setTaxText] = useState('Incl. of all Taxes');
  const [packContents, setPackContents] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategoryFilter]);

  const loadMasterData = async () => {
    try {
      const [cats, mfgs, ccs, wars] = await Promise.all([
        categoriesApi.getAll(),
        manufacturersApi.getAll(),
        customerCareApi.getAll(),
        warrantiesApi.getAll(),
      ]);
      setCategories(cats);
      setManufacturers(mfgs);
      setCustomerCareList(ccs);
      setWarranties(wars);
    } catch (err) {
      console.error('Failed to load master metadata', err);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productsApi.getAll({
        search: searchQuery,
        category_id: selectedCategoryFilter || undefined,
      });
      setProducts(data);
    } catch (err: any) {
      toast.error('Failed to load products list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const cat = categories.find((c) => c.id === newCatId);
    if (cat && !editingProduct) {
      // Auto-prefill category defaults for new products
      if (cat.default_generic_name && !genericName) setGenericName(cat.default_generic_name);
      if (cat.default_country_of_origin) setCountryOfOrigin(cat.default_country_of_origin);
      if (cat.default_net_qty) setNetQuantity(cat.default_net_qty);
      if (cat.default_pack_contents && !packContents) setPackContents(cat.default_pack_contents);
      if (cat.default_warranty) {
        const matchingWarranty = warranties.find((w) => w.name.toLowerCase() === cat.default_warranty?.toLowerCase() || w.duration.toLowerCase() === cat.default_warranty?.toLowerCase());
        if (matchingWarranty) setWarrantyId(matchingWarranty.id);
      }
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    const firstCat = categories[0]?.id || '';
    setCategoryId(firstCat);
    setBrand('');
    setProductNumber('');
    setManufacturerId(manufacturers[0]?.id || '');
    setCustomerCareId(customerCareList[0]?.id || '');
    setWarrantyId(warranties[0]?.id || '');
    setCountryOfOrigin(settings.default_country);
    setGenericName('');
    setNetQuantity('1 N');
    setDefaultMrp(0);
    setTaxText('Incl. of all Taxes');
    setPackContents('');
    setStatus('Active');

    if (categories[0]) {
      const c = categories[0];
      if (c.default_generic_name) setGenericName(c.default_generic_name);
      if (c.default_pack_contents) setPackContents(c.default_pack_contents);
      if (c.default_warranty) {
        const w = warranties.find((w) => w.duration === c.default_warranty || w.name === c.default_warranty);
        if (w) setWarrantyId(w.id);
      }
    }

    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.category_id);
    setBrand(prod.brand || '');
    setProductNumber(prod.product_number || '');
    setManufacturerId(prod.manufacturer_id);
    setCustomerCareId(prod.customer_care_id || '');
    setWarrantyId(prod.warranty_id || '');
    setCountryOfOrigin(prod.country_of_origin || settings.default_country);
    setGenericName(prod.generic_name || '');
    setNetQuantity(prod.net_quantity || '1 N');
    setDefaultMrp(prod.default_mrp || 0);
    setTaxText(prod.tax_text || 'Incl. of all Taxes');
    setPackContents(prod.pack_contents || '');
    setStatus(prod.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product Name is required.');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a Category.');
      return;
    }
    if (!manufacturerId) {
      toast.error('Please select a Manufacturer.');
      return;
    }

    const payload: Partial<Product> = {
      name: name.trim(),
      category_id: categoryId,
      brand: brand.trim(),
      product_number: productNumber.trim(),
      manufacturer_id: manufacturerId,
      customer_care_id: customerCareId,
      warranty_id: warrantyId,
      country_of_origin: countryOfOrigin.trim(),
      generic_name: genericName.trim(),
      net_quantity: netQuantity.trim(),
      default_mrp: Number(defaultMrp) || 0,
      tax_text: taxText.trim(),
      pack_contents: packContents.trim(),
      status,
    };

    setIsSaving(true);
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        toast.success(`Product "${name}" updated.`);
      } else {
        await productsApi.create(payload);
        toast.success(`Product "${name}" created.`);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success(`Product "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      loadProducts();
    } catch (err: any) {
      toast.error('Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain master hardware & software models, pack contents, MRP, and compliance mappings
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by model name, brand, part number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-5">Product Model</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Brand / Part No.</th>
                <th className="py-3 px-5">Warranty</th>
                <th className="py-3 px-5">Default MRP</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Box className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">No Products Found</p>
                      <p className="text-xs text-slate-400">Add master product specifications.</p>
                      <button
                        onClick={openCreateModal}
                        className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 text-xs transition"
                      >
                        + Add Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {p.generic_name || p.category_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {p.category_name || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      <div className="font-semibold">{p.brand || '-'}</div>
                      <div className="text-[11px] font-mono text-slate-400">{p.product_number || '-'}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {p.warranty_name || '5 Years'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {settings.default_currency}{Number(p.default_mrp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => setViewProduct(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product Model' : 'Add New Master Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Product / Model Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HP ProDesk 2 G1a Tower"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Brand / Make
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. HP, Brother, Canon"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Product / Part Number
                  </label>
                  <input
                    type="text"
                    value={productNumber}
                    onChange={(e) => setProductNumber(e.target.value)}
                    placeholder="e.g. HP-PD-2G1A-TW"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Manufacturer Plant <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={manufacturerId}
                    onChange={(e) => setManufacturerId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="" disabled>Select Manufacturer</option>
                    {manufacturers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Customer Care Profile
                  </label>
                  <select
                    value={customerCareId}
                    onChange={(e) => setCustomerCareId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="">None / Custom</option>
                    {customerCareList.map((cc) => (
                      <option key={cc.id} value={cc.id}>{cc.profile_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Warranty
                  </label>
                  <select
                    value={warrantyId}
                    onChange={(e) => setWarrantyId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="">Select Warranty</option>
                    {warranties.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.duration})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="DESKTOP COMPUTER"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    placeholder="India"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Net Quantity
                  </label>
                  <input
                    type="text"
                    value={netQuantity}
                    onChange={(e) => setNetQuantity(e.target.value)}
                    placeholder="1 N"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default MRP ({settings.default_currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={defaultMrp}
                    onChange={(e) => setDefaultMrp(e.target.value)}
                    placeholder="114229"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tax Text
                  </label>
                  <input
                    type="text"
                    value={taxText}
                    onChange={(e) => setTaxText(e.target.value)}
                    placeholder="Incl. of all Taxes"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pack Contents
                </label>
                <textarea
                  rows={2}
                  value={packContents}
                  onChange={(e) => setPackContents(e.target.value)}
                  placeholder="Desktop Computer 1 N, CPU 1 N, Cable Set 1 N, Keyboard 1 N, Mouse 1 N"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewProduct.name}</h3>
                <p className="text-xs text-blue-600 font-semibold">{viewProduct.category_name}</p>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">Brand / Make</span>
                  <span className="text-slate-800 font-bold">{viewProduct.brand || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">Part Number</span>
                  <span className="text-slate-800 font-mono font-bold">{viewProduct.product_number || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">MRP (Default)</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">
                    {settings.default_currency}{Number(viewProduct.default_mrp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">Net Quantity</span>
                  <span className="text-slate-800 font-bold">{viewProduct.net_quantity}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Manufacturer</span>
                <span className="text-slate-800 font-semibold">{viewProduct.manufacturer_name}</span>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Customer Care Profile</span>
                <span className="text-slate-800 font-semibold">{viewProduct.customer_care_name || 'Standard'}</span>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Pack Contents</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[11px] leading-relaxed">
                  {viewProduct.pack_contents || 'None specified'}
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        itemName={deleteTarget?.name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
