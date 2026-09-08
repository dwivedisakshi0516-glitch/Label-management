import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit2, Trash2, X, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '../types';
import { categoriesApi, productsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DeleteModal } from '../components/common/DeleteModal';

export const Categories: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultWarranty, setDefaultWarranty] = useState('5 Years');
  const [defaultGenericName, setDefaultGenericName] = useState('');
  const [defaultCountryOfOrigin, setDefaultCountryOfOrigin] = useState('India');
  const [defaultNetQty, setDefaultNetQty] = useState('1 N');
  const [defaultPackContents, setDefaultPackContents] = useState('');

  useEffect(() => {
    loadCategories();
  }, [searchQuery, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const [categoryPage, products] = await Promise.all([
        categoriesApi.getPage({
          search: searchQuery,
          page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        productsApi.getAll(),
      ]);
      const counts = products.reduce<Record<string, number>>((acc, product) => {
        if (product.category_id) {
          acc[product.category_id] = (acc[product.category_id] || 0) + 1;
        }
        if (product.category_name) {
          const nameKey = product.category_name.toLowerCase();
          acc[nameKey] = (acc[nameKey] || 0) + 1;
        }
        return acc;
      }, {});
      const pageItems = Array.isArray(categoryPage.items) ? categoryPage.items : [];
      setCategories(pageItems);
      setProductCounts(counts);
      setTotalItems(Number(categoryPage.total) || pageItems.length);
      setTotalPages(Math.max(1, Number(categoryPage.total_pages) || 1));
      setPage(Math.max(1, Number(categoryPage.page) || 1));
    } catch (err: any) {
      toast.error('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    setPage(1);
    if (sortBy === field) {
      setSortOrder((current) => current === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortBy(field);
    setSortOrder('asc');
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      );
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />;
  };

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setDefaultWarranty('5 Years');
    setDefaultGenericName('');
    setDefaultCountryOfOrigin('India');
    setDefaultNetQty('1 N');
    setDefaultPackContents('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setDefaultWarranty(cat.default_warranty || '5 Years');
    setDefaultGenericName(cat.default_generic_name || '');
    setDefaultCountryOfOrigin(cat.default_country_of_origin || 'India');
    setDefaultNetQty(cat.default_net_qty || '1 N');
    setDefaultPackContents(cat.default_pack_contents || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category Name is required.');
      return;
    }

    const payload: Partial<Category> = {
      name: name.trim(),
      description: description.trim(),
      default_warranty: defaultWarranty.trim(),
      default_generic_name: defaultGenericName.trim(),
      default_country_of_origin: defaultCountryOfOrigin.trim(),
      default_net_qty: defaultNetQty.trim(),
      default_pack_contents: defaultPackContents.trim(),
    };

    setIsSaving(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, payload);
        toast.success(`Category "${name}" updated successfully.`);
      } else {
        await categoriesApi.create(payload);
        toast.success(`Category "${name}" created successfully.`);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(deleteTarget.id);
      toast.success(`Category "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err: any) {
      toast.error('Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Category Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure product categories with automated default label attributes
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name, description, or generic term..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-xs table-fixed">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-5 w-[31%]">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-600 transition hover:text-slate-900"
                  >
                    <span>Category Name</span>
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="py-3 px-3 w-[8%] text-center">
                  <button
                    type="button"
                    onClick={() => handleSort('product_count')}
                    className="group inline-flex items-center justify-center gap-1.5 font-semibold uppercase tracking-wider text-slate-600 transition hover:text-slate-900"
                  >
                    <span>Products</span>
                    {renderSortIcon('product_count')}
                  </button>
                </th>
                <th className="py-3 px-4 w-[22%]">
                  <button
                    type="button"
                    onClick={() => handleSort('default_generic_name')}
                    className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-600 transition hover:text-slate-900"
                  >
                    <span>Default Generic Name</span>
                    {renderSortIcon('default_generic_name')}
                  </button>
                </th>
                <th className="py-3 px-4 w-[13%]">
                  <button
                    type="button"
                    onClick={() => handleSort('default_warranty')}
                    className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-600 transition hover:text-slate-900"
                  >
                    <span>Default Warranty</span>
                    {renderSortIcon('default_warranty')}
                  </button>
                </th>
                <th className="py-3 px-4 w-[10%]">
                  <button
                    type="button"
                    onClick={() => handleSort('default_country_of_origin')}
                    className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-600 transition hover:text-slate-900"
                  >
                    <span>Origin</span>
                    {renderSortIcon('default_country_of_origin')}
                  </button>
                </th>
                <th className="py-3 px-4 w-[8%]">
                  <button
                    type="button"
                    onClick={() => handleSort('default_net_qty')}
                    className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-600 transition hover:text-slate-900"
                  >
                    <span>Net Qty</span>
                    {renderSortIcon('default_net_qty')}
                  </button>
                </th>
                <th className="py-3 px-4 w-[8%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">No Categories Found</p>
                      <p className="text-xs text-slate-400">Add your first category to start organizing products.</p>
                      <button
                        onClick={openCreateModal}
                        className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 text-xs transition"
                      >
                        + Add Category
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5 align-middle">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-950 text-sm leading-5 truncate">{cat.name}</div>
                        <div className="mt-0.5 text-[11px] leading-4 text-slate-500 truncate">
                          {cat.description || 'No category metadata added'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center align-middle">
                      <span className="inline-flex h-6 min-w-9 items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                        {productCounts[cat.id] ?? productCounts[cat.name.toLowerCase()] ?? cat.product_count ?? 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-middle font-medium text-slate-700">
                      <span className="block truncate">{cat.default_generic_name || '-'}</span>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <span className="inline-flex h-6 items-center rounded-md bg-blue-50 px-2 text-[11px] font-semibold text-blue-700">
                        {cat.default_warranty || '5 Years'}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-middle text-slate-600">
                      <span className="block truncate">{cat.default_country_of_origin || 'India'}</span>
                    </td>
                    <td className="py-4 px-4 align-middle text-slate-600 font-medium">
                      <span className="block truncate">{cat.default_net_qty || '1 N'}</span>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{rangeStart}</span>-
              <span className="font-semibold text-slate-700">{rangeEnd}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalItems}</span>
            </span>
            <label className="flex items-center gap-2">
              <span>Rows</span>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-hidden transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              >
                {[5, 10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Desktop Computer"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief category description..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default Warranty
                  </label>
                  <input
                    type="text"
                    value={defaultWarranty}
                    onChange={(e) => setDefaultWarranty(e.target.value)}
                    placeholder="5 Years"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default Generic Name
                  </label>
                  <input
                    type="text"
                    value={defaultGenericName}
                    onChange={(e) => setDefaultGenericName(e.target.value)}
                    placeholder="DESKTOP COMPUTER"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default Country of Origin
                  </label>
                  <input
                    type="text"
                    value={defaultCountryOfOrigin}
                    onChange={(e) => setDefaultCountryOfOrigin(e.target.value)}
                    placeholder="India"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default Net Quantity
                  </label>
                  <input
                    type="text"
                    value={defaultNetQty}
                    onChange={(e) => setDefaultNetQty(e.target.value)}
                    placeholder="1 N"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Default Pack Contents
                </label>
                <textarea
                  rows={2}
                  value={defaultPackContents}
                  onChange={(e) => setDefaultPackContents(e.target.value)}
                  placeholder="e.g. Desktop Computer 1 N, Keyboard 1 N, Mouse 1 N"
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
                    <span>Save Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        itemName={deleteTarget?.name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
