import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Users, AlertCircle, X, Loader2 } from 'lucide-react';
import { getOwners, createOwner, updateOwner, deleteOwner } from '../api';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/shared/Breadcrumb';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';

const OwnerForm = ({ isOpen, onClose, owner, onSaved }) => {
  const isEdit = Boolean(owner);
  const [form, setForm] = useState({ fullName: '', email: '', businessUnit: '', role: 'Tool Owner', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(owner ? { ...owner } : { fullName: '', email: '', businessUnit: '', role: 'Tool Owner', phone: '' });
      setError('');
    }
  }, [isOpen, owner]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        await updateOwner(owner._id, form);
      } else {
        await createOwner(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save owner.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <h2 className="font-semibold text-[#0D1514]">{isEdit ? 'Edit Owner' : 'Add Owner'}</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Full Name *</label>
            <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className={inputCls} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} placeholder="jane@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Business Unit</label>
            <input value={form.businessUnit} onChange={e => setForm({...form, businessUnit: e.target.value})} className={inputCls} placeholder="e.g. Engineering" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Role</label>
            <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inputCls} placeholder="e.g. Product Manager" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Phone (optional)</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputCls} placeholder="+1 555-0100" />
          </div>
          {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-xl bg-[#00B097] text-white font-semibold hover:bg-[#009B85] transition-colors disabled:opacity-60 flex justify-center items-center">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ToolOwnersPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await getOwners();
      if (res.data?.success) setOwners(res.data.data);
    } catch (err) {
      setError('Failed to load owners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOwners(); }, []);

  const handleDelete = async (id) => {
    if (!isAdmin || !confirm('Are you sure you want to delete this owner? Their tools will remain but be unassigned.')) return;
    try {
      await deleteOwner(id);
      fetchOwners();
    } catch (err) {
      alert('Failed to delete owner.');
    }
  };

  const filtered = owners.filter(o => 
    o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.businessUnit || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Tool Owners' }]} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1514]">Tool Owners</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage personnel responsible for security tools</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="Search owners..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8F0] bg-white/60 backdrop-blur-sm text-sm focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10 outline-none transition-all" />
          </div>
          {isAdmin && (
            <button onClick={() => { setEditingOwner(null); setFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#00B097] hover:bg-[#009B85] text-white text-sm font-semibold rounded-xl transition-colors shrink-0">
              <Plus size={16} /> Add Owner
            </button>
          )}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-glass overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
        ) : error ? (
          <EmptyState message={error} icon={Users} />
        ) : filtered.length === 0 ? (
          <EmptyState message="No tool owners found." icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Contact</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Business Unit</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Role</th>
                  {isAdmin && <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map(owner => (
                  <tr key={owner._id} className="hover:bg-white/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#0D1514]">{owner.fullName}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-[#0D1514]">{owner.email}</div>
                      {owner.phone && <div className="text-xs text-[#64748B] mt-0.5">{owner.phone}</div>}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#334155]">{owner.businessUnit || '—'}</td>
                    <td className="py-3 px-4 text-sm text-[#334155]">{owner.role || '—'}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditingOwner(owner); setFormOpen(true); }} className="p-1.5 text-[#94A3B8] hover:text-[#00B097] hover:bg-[#E6F7F5] rounded transition-colors" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(owner._id)} className="p-1.5 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OwnerForm isOpen={formOpen} onClose={() => setFormOpen(false)} owner={editingOwner} onSaved={fetchTools => fetchOwners()} />
    </div>
  );
};
