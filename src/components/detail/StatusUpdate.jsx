import { useState } from 'react';
import { updateControlStatus } from '../../api';
import { Dropdown } from '../shared/Dropdown';

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
    <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4 shadow-sm">
      <h4 className="text-sm text-text-muted uppercase tracking-wider mb-3">Update Status</h4>
      <div className="flex items-center gap-3">
        <Dropdown
          value={status}
          onChange={(val) => setStatus(val)}
          options={[
            { label: 'Pending', value: 'Pending' },
            { label: 'Implemented', value: 'Implemented' },
            { label: 'Not Implemented', value: 'Not Implemented' }
          ]}
        />
        <button
          onClick={handleSave}
          disabled={saving || status === currentStatus}
          className="bg-primary text-text-onPrimary text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-status-notImplemented mt-2">{error}</p>
      )}
    </div>
  );
};
