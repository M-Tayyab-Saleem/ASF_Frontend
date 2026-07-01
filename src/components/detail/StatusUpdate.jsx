import { useState } from 'react';
import { updateControlStatus } from '../../api';

export const StatusUpdate = ({ controlId, currentStatus, onStatusUpdate }) => {
  const [status, setStatus] = useState(currentStatus || 'Pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (status === currentStatus) return;
    setSaving(true);
    setError('');
    try {
      const res = await updateControlStatus(controlId, status);
      if (res.data.success) {
        onStatusUpdate(status);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface-1 border border-border rounded-lg p-4">
      <h4 className="text-sm text-text-muted uppercase tracking-wider mb-3">Update Status</h4>
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#0A0A0A] border border-border rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-gold"
        >
          <option value="Pending">Pending</option>
          <option value="Implemented">Implemented</option>
          <option value="Not Implemented">Not Implemented</option>
        </select>
        <button
          onClick={handleSave}
          disabled={saving || status === currentStatus}
          className="bg-gold text-black text-sm font-medium px-4 py-1.5 rounded hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-[#8A5A5A] mt-2">{error}</p>
      )}
    </div>
  );
};
