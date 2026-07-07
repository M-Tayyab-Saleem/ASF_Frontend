import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { createTool, updateTool, getToolCategories, getOwners } from '../../api';

const STATUS_COLORS = {
  'Active': 'text-green-600 bg-green-50 border-green-200',
  'Under Evaluation': 'text-amber-600 bg-amber-50 border-amber-200',
  'Decommissioned': 'text-slate-600 bg-slate-100 border-slate-200'
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-[#334155] mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputCls = (hasErr) =>
  `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all
   ${hasErr ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10'}`;

export const ToolForm = ({ isOpen, onClose, tool = null, onSaved }) => {
  const isEdit = Boolean(tool);
  
  const [form, setForm] = useState({
    toolId: '',
    name: '',
    category: '',
    vendor: '',
    description: '',
    primaryFunction: '',
    aiControlRelevance: '',
    status: 'Active',
    ownerId: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getToolCategories().then(res => {
        if (res.data?.success) setCategories(res.data.data);
      }).catch(() => {});
      
      getOwners().then(res => {
        if (res.data?.success) setOwners(res.data.data);
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && tool) {
      setForm({
        toolId: tool.toolId || '',
        name: tool.name || tool.toolName || '',
        category: tool.category || tool.toolCategory || '',
        vendor: tool.vendor || '',
        description: tool.description || tool.toolDescription || '',
        primaryFunction: tool.primaryFunction || '',
        aiControlRelevance: tool.aiControlRelevance || '',
        status: tool.status || 'Active',
        ownerId: tool.ownerId?._id || tool.ownerId || ''
      });
    } else {
      setForm({ toolId: '', name: '', category: '', vendor: '', description: '', primaryFunction: '', aiControlRelevance: '', status: 'Active', ownerId: '' });
    }
    setErrors({});
    setGlobalError('');
  }, [isOpen, tool, isEdit]);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.toolId.trim()) e.toolId = 'Tool ID is required';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category) e.category = 'Category is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.ownerId) payload.ownerId = null;

      let saved;
      if (isEdit) {
        // Pass toolId for legacy API or _id if preferred, backend accepts both
        const res = await updateTool(tool._id || tool.toolId, payload);
        saved = res.data.data;
      } else {
        const res = await createTool(payload);
        saved = res.data.data;
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setGlobalError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} tool`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0D1514]/40 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[#0D1514]">
              {isEdit ? 'Edit Tool' : 'Add New Tool'}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {isEdit ? `Editing ${tool.toolId}` : 'Register a new tool in the inventory'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B] transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tool ID" required error={errors.toolId}>
              <input
                value={form.toolId}
                onChange={set('toolId')}
                disabled={isEdit}
                placeholder="e.g. TL-01"
                className={`${inputCls(errors.toolId)} ${isEdit ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed' : ''}`}
              />
            </Field>
            
            <Field label="Status" error={errors.status}>
              <select value={form.status} onChange={set('status')} className={inputCls(errors.status) + ' bg-white'}>
                <option value="Active">Active</option>
                <option value="Under Evaluation">Under Evaluation</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" required error={errors.name}>
              <input value={form.name} onChange={set('name')} placeholder="e.g. Vanta" className={inputCls(errors.name)} />
            </Field>

            <Field label="Vendor" error={errors.vendor}>
              <input value={form.vendor} onChange={set('vendor')} placeholder="e.g. Vanta Inc." className={inputCls(errors.vendor)} />
            </Field>
          </div>

          <Field label="Category" required error={errors.category}>
            <select value={form.category} onChange={set('category')} className={inputCls(errors.category) + ' bg-white'}>
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Owner" error={errors.ownerId}>
            <select value={form.ownerId} onChange={set('ownerId')} className={inputCls(errors.ownerId) + ' bg-white'}>
              <option value="">-- No Owner Assigned --</option>
              {owners.map(o => (
                <option key={o._id} value={o._id}>{o.fullName} ({o.email})</option>
              ))}
            </select>
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="What does this tool do?"
              className={`${inputCls(errors.description)} resize-none`}
            />
          </Field>

          <Field label="Primary Function" error={errors.primaryFunction}>
            <textarea
              value={form.primaryFunction}
              onChange={set('primaryFunction')}
              rows={2}
              placeholder="Primary function of this tool"
              className={`${inputCls(errors.primaryFunction)} resize-none`}
            />
          </Field>

          <Field label="AI Control Relevance" error={errors.aiControlRelevance}>
            <textarea
              value={form.aiControlRelevance}
              onChange={set('aiControlRelevance')}
              rows={2}
              placeholder="How is this tool relevant for AI controls?"
              className={`${inputCls(errors.aiControlRelevance)} resize-none`}
            />
          </Field>

          {form.status && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">Status preview:</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[form.status] || STATUS_COLORS['Active']}`}>
                {form.status}
              </span>
            </div>
          )}

          {globalError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {globalError}
            </div>
          )}
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC] shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#00B097] hover:bg-[#009B85] text-white text-sm font-semibold
                       disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" /> {isEdit ? 'Saving…' : 'Adding…'}</> : isEdit ? 'Save Changes' : 'Add Tool'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
