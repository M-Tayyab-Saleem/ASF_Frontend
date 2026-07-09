import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { createControl, updateControl, suggestControlId } from '../../api';

const RISK_COLORS = {
  High:   'text-red-600 bg-red-50 border-red-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  Low:    'text-green-600 bg-green-50 border-green-200',
};

// ── Small field wrapper ────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export const ControlForm = ({
  isOpen,
  onClose,
  control = null,           // null = create mode, object = edit mode
  capabilities = [],
  onSaved                   // callback(savedControl)
}) => {
  const isEdit = Boolean(control);

  const [form, setForm] = useState({
    controlId:    '',
    title:        '',
    description:  '',
    category:     '',
    riskLevel:    '',
    capabilityId: '',
    strategyId:   '',
    notes:        '',
  });
  const [errors, setErrors]         = useState({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  // Pre-fill form in edit mode or reset in create mode
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && control) {
      setForm({
        controlId:    control.controlId    || '',
        title:        control.title        || control.controlName        || '',
        description:  control.description  || control.controlDescription || '',
        category:     control.category     || control.controlDomain      || '',
        riskLevel:    control.riskLevel    || '',
        capabilityId: control.capabilityId || '',
        strategyId:   control.strategyId   || '',
        notes:        control.notes        || '',
      });
    } else {
      setForm({ controlId: '', title: '', description: '', category: '', riskLevel: '', capabilityId: '', strategyId: '', notes: '' });
    }
    setErrors({});
    setGlobalError('');
  }, [isOpen, control, isEdit]);

  // Auto-suggest controlId when category changes (create mode only)
  const handleCategoryChange = async (val) => {
    setForm(p => ({ ...p, category: val }));
    if (!isEdit && val) {
      setSuggesting(true);
      try {
        const res = await suggestControlId(val);
        setForm(p => ({ ...p, controlId: res.data.data.suggestedId }));
      } catch {
        // non-fatal — user can type manually
      } finally {
        setSuggesting(false);
      }
    }
  };

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.controlId.trim())   e.controlId   = 'Control ID is required';
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category.trim())    e.category    = 'Category is required';
    if (!form.riskLevel)          e.riskLevel   = 'Risk level is required';
    if (!form.capabilityId)       e.capabilityId = 'Linked capability is required';
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
      let saved;
      if (isEdit) {
        const res = await updateControl(control.controlId, form);
        saved = res.data.data;
      } else {
        const res = await createControl(form);
        saved = res.data.data;
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setGlobalError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} control`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0D1514]/40 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[#0D1514]">
              {isEdit ? 'Edit Control' : 'Create New Control'}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {isEdit ? `Editing ${control.controlId}` : 'Fill in the fields below to define a new control'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B] transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-8 space-y-6">

          {/* Control ID */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Control ID" required error={errors.controlId}>
              <div className="relative">
                <input
                  value={form.controlId}
                  onChange={set('controlId')}
                  disabled={isEdit} // ID not editable in edit mode
                  placeholder="e.g. PS-07"
                  className={`${inputCls(errors.controlId)} ${isEdit ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed' : ''} pr-8`}
                />
                {suggesting && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#00B097]" />
                )}
                {!isEdit && !suggesting && form.controlId && (
                  <Sparkles size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00B097]" />
                )}
              </div>
              {!isEdit && <p className="text-[#94A3B8] text-xs mt-1">Auto-suggested from category — override if needed</p>}
            </Field>

            <Field label="Risk Level" required error={errors.riskLevel}>
              <select value={form.riskLevel} onChange={set('riskLevel')}
                className={inputCls(errors.riskLevel) + ' bg-white'}>
                <option value="">Select risk level…</option>
                {['High', 'Medium', 'Low'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Title */}
          <Field label="Title" required error={errors.title}>
            <input value={form.title} onChange={set('title')} placeholder="Control title…"
              className={inputCls(errors.title)} />
          </Field>

          {/* Description */}
          <Field label="Description" required error={errors.description}>
            <textarea value={form.description} onChange={set('description')}
              placeholder="Describe what this control does and why it's important…"
              rows={3} className={`${inputCls(errors.description)} resize-none`} />
          </Field>

          {/* Notes */}
          <Field label="Notes" error={errors.notes}>
            <textarea value={form.notes} onChange={set('notes')}
              placeholder="Additional notes for this control…"
              rows={3} className={`${inputCls(errors.notes)} resize-none`} />
          </Field>

          {/* Category */}
          <Field label="Category" required error={errors.category}>
            <input
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="e.g. Prompt Security, Data Governance…"
              className={inputCls(errors.category)}
            />
          </Field>

          {/* Linked Capability */}
          <Field label="Linked Capability" required error={errors.capabilityId}>
            <select value={form.capabilityId} onChange={set('capabilityId')}
              className={inputCls(errors.capabilityId) + ' bg-white'}>
              <option value="">Select a capability…</option>
              {capabilities.map(cap => (
                <option key={cap.capabilityId || cap._id} value={cap.capabilityId || cap._id}>
                  {cap.capabilityName}
                </option>
              ))}
            </select>
          </Field>

          {/* Risk level preview chip */}
          {form.riskLevel && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">Risk preview:</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${RISK_COLORS[form.riskLevel]}`}>
                {form.riskLevel} Risk
              </span>
            </div>
          )}

          {globalError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {globalError}
            </div>
          )}
        </form>

        {/* ── Footer ── */}
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
            {submitting
              ? <><Loader2 size={14} className="animate-spin" /> {isEdit ? 'Saving…' : 'Creating…'}</>
              : isEdit ? 'Save Changes' : 'Create Control'
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
