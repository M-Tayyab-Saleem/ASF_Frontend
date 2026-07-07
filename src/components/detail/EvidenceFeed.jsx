import { FileText, Image, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EvidenceFeed = ({ evidenceList, onDelete, onDownload }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!evidenceList || evidenceList.length === 0) {
    return <div className="text-sm text-slate-500 py-4">No evidence uploaded yet.</div>;
  }

  // Calculate relative timestamp e.g. "2h ago", "1d ago"
  const getRelativeTime = (dateStr) => {
    const d = new Date(dateStr);
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">
      {evidenceList.map(ev => {
        const isImage = ev.fileType === 'image' || ['png','jpg','jpeg','webp'].some(ext => ev.fileName.toLowerCase().endsWith(ext));
        const Icon = isImage ? Image : FileText;

        return (
          <div key={ev._id || ev.evidenceId} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50 group">
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-[#009681] shrink-0">
              <Icon size={20} />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 truncate">{ev.fileName}</div>
              {ev.controlName && (
                <div className="text-xs font-medium text-slate-500 mt-0.5 truncate">{ev.controlName}</div>
              )}
              {ev.category && (
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">
                  {ev.category}
                </div>
              )}
              
              {/* Extra info for detail view */}
              {ev.uploadedBy && (
                <div className="text-xs text-slate-400 mt-2">
                  Uploaded by {ev.uploadedBy?.fullName || 'Unknown'}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-xs text-slate-400 font-medium whitespace-nowrap bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                {getRelativeTime(ev.uploadedAt)}
              </div>
              
              {(onDownload || onDelete) && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  {onDownload && (
                    <button
                      onClick={() => onDownload(ev)}
                      className="p-1.5 text-slate-400 hover:text-[#00B097] bg-white rounded-lg border border-slate-100 shadow-sm transition-colors"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                  )}
                  {isAdmin && onDelete && (
                    <button
                      onClick={() => onDelete(ev._id || ev.evidenceId)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 bg-white rounded-lg border border-slate-100 shadow-sm transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
