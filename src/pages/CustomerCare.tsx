import React, { useState, useEffect } from 'react';
import { Headphones, Plus, Search, Edit2, Trash2, X, Mail, Phone, MessageSquare, Globe, MapPin } from 'lucide-react';
import { CustomerCare } from '../types';
import { customerCareApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DeleteModal } from '../components/common/DeleteModal';

export const CustomerCareView: React.FC = () => {
  const toast = useToast();
  const [profiles, setProfiles] = useState<CustomerCare[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerCare | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<CustomerCare | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [profileName, setProfileName] = useState('');
  const [complaintText, setComplaintText] = useState('Customer Care');
  const [complaintAddress, setComplaintAddress] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [tollFreeNumber, setTollFreeNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    loadProfiles();
  }, [searchQuery]);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const data = await customerCareApi.getAll(searchQuery);
      setProfiles(data);
    } catch (err: any) {
      toast.error('Failed to load customer care profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setProfileName('');
    setComplaintText('Customer Care');
    setComplaintAddress('');
    setEmail('');
    setTelephone('');
    setTollFreeNumber('');
    setWhatsappNumber('');
    setWebsite('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: CustomerCare) => {
    setEditingItem(item);
    setProfileName(item.profile_name);
    setComplaintText(item.complaint_text || 'Customer Care');
    setComplaintAddress(item.complaint_address || '');
    setEmail(item.email || '');
    setTelephone(item.telephone || '');
    setTollFreeNumber(item.toll_free_number || '');
    setWhatsappNumber(item.whatsapp_number || '');
    setWebsite(item.website || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Profile Name is required.');
      return;
    }

    const payload: Partial<CustomerCare> = {
      profile_name: profileName.trim(),
      complaint_text: complaintText.trim(),
      complaint_address: complaintAddress.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      toll_free_number: tollFreeNumber.trim(),
      whatsapp_number: whatsappNumber.trim(),
      website: website.trim(),
    };

    setIsSaving(true);
    try {
      if (editingItem) {
        await customerCareApi.update(editingItem.id, payload);
        toast.success(`Customer Care "${profileName}" updated.`);
      } else {
        await customerCareApi.create(payload);
        toast.success(`Customer Care "${profileName}" added.`);
      }
      setIsModalOpen(false);
      loadProfiles();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save customer care profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await customerCareApi.delete(deleteTarget.id);
      toast.success(`Customer Care "${deleteTarget.profile_name}" deleted.`);
      setDeleteTarget(null);
      loadProfiles();
    } catch (err: any) {
      toast.error('Failed to delete profile.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Care Profiles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage reusable customer support numbers, complaint addresses, emails, and WhatsApp helpdesks
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Profile</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search profiles by title, email, phone, or address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-5">Profile Name</th>
                <th className="py-3 px-5">Complaint Address</th>
                <th className="py-3 px-5">Contact Channels</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <span>Loading support profiles...</span>
                    </div>
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Headphones className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">No Profiles Found</p>
                      <p className="text-xs text-slate-400">Create your first customer support profile.</p>
                      <button
                        onClick={openCreateModal}
                        className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 text-xs transition"
                      >
                        + Add Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{p.profile_name}</div>
                      <span className="text-[11px] text-blue-700 font-medium">
                        Heading: {p.complaint_text || 'Customer Care'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-sm">
                      <p className="text-slate-700 font-medium line-clamp-2">
                        {p.complaint_address || '-'}
                      </p>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 space-y-1">
                      {p.email && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{p.email}</span>
                        </div>
                      )}
                      {p.telephone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Tel: {p.telephone}</span>
                        </div>
                      )}
                      {p.whatsapp_number && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MessageSquare className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>WA: {p.whatsapp_number}</span>
                        </div>
                      )}
                      {p.website && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Globe className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{p.website}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Profile"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Customer Care Profile' : 'Add New Customer Care Profile'}
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
                  Profile Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. HP India Customer Care"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Complaint Section Heading
                </label>
                <input
                  type="text"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="e.g. For Complaints: Customer Care"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Complaint / Service Address
                </label>
                <textarea
                  rows={2}
                  value={complaintAddress}
                  onChange={(e) => setComplaintAddress(e.target.value)}
                  placeholder="Service cell address for physical correspondence..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="in.contact@hp.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Telephone (Tel)
                  </label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="1-800-425-4999"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Toll-Free Number
                  </label>
                  <input
                    type="text"
                    value={tollFreeNumber}
                    onChange={(e) => setTollFreeNumber(e.target.value)}
                    placeholder="1800-258-7170"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91-8867619377"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Website / Support Portal
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.hp.com/in"
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
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Customer Care Profile"
        itemName={deleteTarget?.profile_name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
