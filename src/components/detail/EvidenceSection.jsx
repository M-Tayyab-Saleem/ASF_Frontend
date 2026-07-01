import { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Trash2, FileText, Image } from 'lucide-react';
import { getEvidence, uploadEvidence, downloadEvidence, deleteEvidence } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

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
    const allowedExts = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    if (!allowedExts.includes(ext)) {
      setError('Only PDF and image files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10 MB limit');
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
      <hr className="border-border mb-6" />
      <h3 className="text-lg font-medium text-text-primary mb-4">Evidence</h3>

      <div className="mb-4">
        <label className="inline-flex items-center gap-2 cursor-pointer bg-gold text-black text-sm font-medium px-4 py-2 rounded hover:bg-gold-light transition-colors">
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
            <div className="bg-gold h-full rounded transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
        {error && <p className="text-xs text-[#8A5A5A] mt-1">{error}</p>}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : evidenceList.length === 0 ? (
        <p className="text-sm text-text-muted">No evidence uploaded yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left py-2 px-2">File Name</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-right py-2 px-2">Size</th>
                {isAdmin && <th className="text-left py-2 px-2">Uploaded By</th>}
                <th className="text-right py-2 px-2">Uploaded At</th>
                <th className="text-right py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evidenceList.map((item) => (
                <tr key={item._id} className="border-b border-border hover:bg-surface-2 transition-colors">
                  <td className="py-2 px-2 text-text-primary">
                    <span className="flex items-center gap-1">
                      {item.fileType === 'image' ? <Image size={14} className="text-text-muted" /> : <FileText size={14} className="text-text-muted" />}
                      {item.fileName}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-text-secondary uppercase">{item.fileType}</td>
                  <td className="py-2 px-2 text-text-secondary text-right">{formatFileSize(item.fileSizeBytes)}</td>
                  {isAdmin && (
                    <td className="py-2 px-2 text-text-secondary">{item.uploadedBy?.fullName || 'Unknown'}</td>
                  )}
                  <td className="py-2 px-2 text-text-secondary text-right">{formatDate(item.uploadedAt)}</td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1 text-text-muted hover:text-gold transition-colors"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-text-muted hover:text-[#8A5A5A] transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
