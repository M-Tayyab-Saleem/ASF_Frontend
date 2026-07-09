import { useState, useRef } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { addControlNote } from '../../api';

export const NotesSection = ({ control, onNoteAdded }) => {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const notes = control?.notes || [];

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await addControlNote(control.controlId, newNote);
      if (res.data?.success) {
        setNewNote('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        if (onNoteAdded) {
          onNoteAdded(res.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextChange = (e) => {
    setNewNote(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const fmtDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-[#94A3B8]" />
        <h3 className="text-sm font-semibold text-[#334155]">Implementation Details</h3>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl p-4">
        {notes.length > 0 ? (
          <div className="space-y-4 mb-6">
            {notes.map((note, idx) => (
              <div key={note._id || idx} className="bg-white/50 rounded-lg p-3 border border-[#E2E8F0]">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-[#0D1514]">
                    {note.addedBy?.fullName || 'Unknown User'}
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    {fmtDate(note.addedAt)}
                  </span>
                </div>
                <p className="text-sm text-[#334155] whitespace-pre-wrap">{note.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#94A3B8] mb-4">No implementation details added yet. Be the first to add one!</p>
        )}

        <form onSubmit={handleAddNote} className="relative">
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={handleTextChange}
            placeholder="Add implementation details..."
            rows={2}
            className="w-full pl-3 pr-12 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10 outline-none text-sm resize-none bg-white/80 overflow-hidden"
            style={{ minHeight: '40px' }}
          />
          <button
            type="submit"
            disabled={submitting || !newNote.trim()}
            className="absolute right-2 bottom-3 p-1.5 bg-[#00B097] hover:bg-[#009B85] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
};
