import { useState, useRef } from 'react';
import { MessageSquare, Send, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { addControlNote, updateControlNote, deleteControlNote } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const NotesSection = ({ control, onNotesChanged }) => {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  // Edit state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  const editTextareaRef = useRef(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const notes = control?.notes || [];

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await addControlNote(control.controlId || control._id, newNote);
      if (res.data?.success) {
        setNewNote('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        if (onNotesChanged) {
          onNotesChanged([...notes, res.data.data]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add implementation detail');
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

  const handleEditTextChange = (e) => {
    setEditingNoteText(e.target.value);
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  };

  const startEditing = (note) => {
    setEditingNoteId(note._id);
    setEditingNoteText(note.text);
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.style.height = 'auto';
        editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
        editTextareaRef.current.focus();
      }
    }, 0);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const submitEdit = async (noteId) => {
    if (!editingNoteText.trim()) return;
    setEditingSubmitting(true);
    try {
      const res = await updateControlNote(control.controlId || control._id, noteId, editingNoteText);
      if (res.data?.success) {
        setEditingNoteId(null);
        if (onNotesChanged) {
          onNotesChanged(notes.map(n => n._id === noteId ? res.data.data : n));
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update implementation detail');
    } finally {
      setEditingSubmitting(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this implementation detail?')) return;
    try {
      const res = await deleteControlNote(control.controlId || control._id, noteId);
      if (res.data?.success) {
        if (onNotesChanged) {
          onNotesChanged(notes.filter(n => n._id !== noteId));
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete implementation detail');
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

  const canModify = (note) => {
    if (!user) return false;
    if (isAdmin) return true;
    return note.addedBy?._id === user._id || note.addedBy === user._id;
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
                {editingNoteId === note._id ? (
                  <div className="relative">
                    <textarea
                      ref={editTextareaRef}
                      value={editingNoteText}
                      onChange={handleEditTextChange}
                      className="w-full p-2 pr-16 rounded-md border border-[#E2E8F0] focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10 outline-none text-sm resize-none bg-white overflow-hidden"
                      style={{ minHeight: '40px' }}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <button
                        onClick={cancelEditing}
                        disabled={editingSubmitting}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => submitEdit(note._id)}
                        disabled={editingSubmitting || !editingNoteText.trim() || editingNoteText === note.text}
                        className="p-1.5 text-white bg-[#00B097] hover:bg-[#009B85] rounded-md disabled:opacity-50 transition-colors"
                        title="Save"
                      >
                        {editingSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-1 group">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#0D1514]">
                          {note.addedBy?.fullName || 'Unknown User'}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {fmtDate(note.addedAt)}
                        </span>
                      </div>
                      
                      {canModify(note) && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(note)}
                            className="p-1.5 text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#E0F2FE] rounded-md transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteNote(note._id)}
                            className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#334155] whitespace-pre-wrap">{note.text}</p>
                  </>
                )}
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
