import { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Trash2, FileText, Image } from 'lucide-react';
import { getEvidence, uploadEvidence, downloadEvidence, deleteEvidence } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EvidenceFeed } from './EvidenceFeed';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const EvidenceSection = ({ controlId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const fetchEvidence = useCallback(async () => {
    try {
      const res = await getEvidence(controlId);
      if (res.data.success) {
        setEvidenceList(res.data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [controlId]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'];
    if (!allowedExts.includes(ext)) {
      setError('Only PDF, TXT, and image files are allowed');
      return;
    }

    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'];
    if (!allowedMimeTypes.includes(file.type)) {
      setError('Invalid file type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5 MB limit');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadEvidence(controlId, formData);
      setUploadProgress(100);
      fetchEvidence();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDownload = async (item) => {
    try {
      const res = await downloadEvidence(controlId, item._id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Download failed');
    }
  };

  const handleDelete = async (evidenceId) => {
    try {
      await deleteEvidence(evidenceId);
      fetchEvidence();
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <div className="mt-8">
      <hr className="border-white/50 mb-6" />
      <h3 className="text-lg  text-text-primary mb-4">Evidence</h3>

      <div className="mb-4">
        <label className="inline-flex items-center gap-2 cursor-pointer bg-primary text-text-onPrimary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors">
          <Upload size={16} />
          {uploading ? `Uploading...` : 'Upload Evidence'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {uploading && (
          <div className="mt-2 w-full bg-surface-2 rounded h-1">
            <div className="bg-primary h-full rounded transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
        {error && <p className="text-xs text-status-notImplemented mt-1">{error}</p>}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : (
        <EvidenceFeed 
          evidenceList={evidenceList} 
          onDownload={handleDownload} 
          onDelete={handleDelete} 
        />
      )}
    </div>
  );
};
