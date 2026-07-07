import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, RotateCcw, X, Mail, Calendar, Shield,
  Loader2, AlertCircle, CheckCircle2, Clock, Ban, Users, UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInvites, createInvite, resendInvite, revokeInvite, getUsers, updateUserRole } from '../api/index';

// ─── Status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    active:   { label: 'Active',   icon: CheckCircle2, bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
    pending:  { label: 'Pending',  icon: Clock,        bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
    accepted: { label: 'Accepted', icon: CheckCircle2, bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
    expired:  { label: 'Expired',  icon: AlertCircle,  bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200'   },
    revoked:  { label: 'Revoked',  icon: Ban,          bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200' },
  };
  const { label, icon: Icon, bg, text, border } = config[status] || config.expired;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      <Icon size={11} /> {label}
    </span>
  );
};

// ─── Role badge ────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
    ${role === 'admin' ? 'bg-[#EDE9FC] text-[#6D4AC8]' : 'bg-[#E6F7F5] text-[#007A68]'}`}>
    <Shield size={10} />
    {role === 'admin' ? 'Admin' : 'User'}
  </span>
);

// ─── Toast ─────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${type === 'success' ? 'bg-[#00B097] text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
};

// ─── Invite User Modal ─────────────────────────────────────────────────────
const InviteModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ fullName: '', email: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await createInvite(form);
      onSuccess(form.email);
      onClose();
    } catch (err) {
      setGlobalError(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-[#E6F7F5] rounded-xl">
              <UserPlus size={18} className="text-[#00B097]" />
            </div>
            <h2 className="text-base font-semibold text-[#0D1514]">Invite New User</h2>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Full Name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => { setForm(p => ({ ...p, fullName: e.target.value })); setErrors(p => ({ ...p, fullName: '' })); }}
              placeholder="Jane Smith"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10'}`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="jane@example.com"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10 bg-white"
            >
              <option value="user">User — read access, can upload evidence</option>
              <option value="admin">Admin — full access, can manage controls & tools</option>
            </select>
          </div>

          {globalError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {globalError}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#00B097] hover:bg-[#009B85] text-white text-sm font-semibold
                         disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Mail size={14} /> Send Invite</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Confirm Revoke Modal ──────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-[#0D1514] text-center mb-2">Confirm Revoke</h3>
      <p className="text-[#64748B] text-sm text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                     disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : null} Revoke
        </button>
      </div>
    </div>
  </div>
);

// ─── Date formatter ────────────────────────────────────────────────────────
const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Main Page ─────────────────────────────────────────────────────────────
export const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]           = useState([]);
  const [invites, setInvites]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(null); // { id, email }
  const [revoking, setRevoking]     = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // { [inviteId]: bool }
  const [toast, setToast]           = useState(null);
  
  const [activeTab, setActiveTab]   = useState('users'); // 'users' or 'invites'

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true });
  }, [user, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, userRes] = await Promise.all([
        getInvites(),
        getUsers()
      ]);
      setInvites(invRes.data.data || []);
      setUsers(userRes.data.data || []);
    } catch {
      setToast({ message: 'Failed to load user data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── User Roles ───────────────────────────────────────────────────────────
  const handleRoleChange = async (targetUser, newRole) => {
    setActionLoading(p => ({ ...p, [targetUser.id]: 'updating' }));
    try {
      await updateUserRole(targetUser.id, newRole);
      showToast(`Updated role for ${targetUser.fullName}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update role', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [targetUser.id]: null }));
    }
  };

  // ── Resend ───────────────────────────────────────────────────────────────
  const handleResend = async (inv) => {
    setActionLoading(p => ({ ...p, [inv._id]: 'resending' }));
    try {
      await resendInvite(inv.token);
      showToast(`Invite resent to ${inv.email}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to resend', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [inv._id]: null }));
    }
  };

  // ── Revoke ───────────────────────────────────────────────────────────────
  const handleRevoke = async () => {
    if (!confirmRevoke) return;
    setRevoking(true);
    try {
      await revokeInvite(confirmRevoke.id);
      showToast('Invite revoked');
      setConfirmRevoke(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to revoke', 'error');
    } finally {
      setRevoking(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#E6F7F5] rounded-xl">
            <Users size={20} className="text-[#00B097]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0D1514]">User Management</h1>
            <p className="text-[#64748B] text-sm">Manage users, roles, and pending invitations</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00B097] hover:bg-[#009B85] text-white text-sm
                     font-semibold rounded-xl transition-colors shadow-sm"
        >
          <UserPlus size={16} /> Invite User
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'border-[#00B097] text-[#00B097]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          Active Users
        </button>
        <button
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'invites' ? 'border-[#00B097] text-[#00B097]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('invites')}
        >
          Pending Invitations
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
            <Loader2 size={22} className="animate-spin text-[#00B097]" />
            <span className="text-sm">Loading data…</span>
          </div>
        ) : activeTab === 'users' ? (
          users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-[#334155] font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-4 font-medium text-[#0D1514]">{u.fullName}</td>
                      <td className="px-5 py-4 text-[#64748B]">{u.email}</td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4"><StatusBadge status="active" /></td>
                      <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-[#CBD5E1]" />
                          {fmt(u.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {u.id !== user.id ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              disabled={actionLoading[u.id] === 'updating'}
                              className="text-xs px-2 py-1.5 border rounded-lg bg-white border-[#E2E8F0] focus:border-[#00B097] outline-none disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="text-xs text-[#94A3B8]">(You)</span>
                          )}
                          {actionLoading[u.id] === 'updating' && <Loader2 size={12} className="animate-spin text-[#00B097]" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-[#F8FAFC] rounded-full mb-2">
                <Mail size={28} className="text-[#CBD5E1]" />
              </div>
              <p className="text-[#334155] font-medium">No invitations yet</p>
              <p className="text-[#94A3B8] text-sm">Click "Invite User" to send your first invite.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    {['Name', 'Email', 'Role', 'Status', 'Sent', 'Expires', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {invites.map((inv) => {
                    const isExpired = inv.status === 'pending' && new Date(inv.expiresAt) < new Date();
                    const displayStatus = isExpired ? 'expired' : inv.status;
                    const canResend = displayStatus === 'pending' || displayStatus === 'expired';
                    const canRevoke = inv.status === 'pending' && !isExpired;
  
                    return (
                      <tr key={inv._id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-4 font-medium text-[#0D1514]">{inv.fullName}</td>
                        <td className="px-5 py-4 text-[#64748B]">{inv.email}</td>
                        <td className="px-5 py-4"><RoleBadge role={inv.role} /></td>
                        <td className="px-5 py-4"><StatusBadge status={displayStatus} /></td>
                        <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#CBD5E1]" />
                            {fmt(inv.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                          <span className={`flex items-center gap-1.5 ${isExpired ? 'text-red-400' : ''}`}>
                            <Clock size={12} className={isExpired ? 'text-red-300' : 'text-[#CBD5E1]'} />
                            {fmt(inv.expiresAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {canResend && (
                              <button
                                onClick={() => handleResend(inv)}
                                disabled={actionLoading[inv._id] === 'resending'}
                                title="Resend invite"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00B097] border border-[#00B097]/30
                                           hover:bg-[#E6F7F5] rounded-lg transition-colors disabled:opacity-50"
                              >
                                {actionLoading[inv._id] === 'resending'
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : <RotateCcw size={12} />}
                                Resend
                              </button>
                            )}
                            {canRevoke && (
                              <button
                                onClick={() => setConfirmRevoke({ id: inv._id, email: inv.email })}
                                title="Revoke invite"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200
                                           hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={12} /> Revoke
                              </button>
                            )}
                            {!canResend && !canRevoke && (
                              <span className="text-[#CBD5E1] text-xs">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <InviteModal
          onClose={() => setShowModal(false)}
          onSuccess={(email) => {
            showToast(`Invite sent to ${email}`);
            fetchData();
          }}
        />
      )}
      {confirmRevoke && (
        <ConfirmModal
          message={`Revoke the invite for ${confirmRevoke.email}? The link will become invalid immediately.`}
          onConfirm={handleRevoke}
          onCancel={() => setConfirmRevoke(null)}
          loading={revoking}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
