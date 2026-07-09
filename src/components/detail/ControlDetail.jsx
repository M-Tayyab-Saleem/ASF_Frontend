import { useState, useEffect, useCallback } from 'react';
import { Pencil, ChevronDown, ChevronRight, AlertTriangle, User, Tag, Wrench, History, Plus } from 'lucide-react';
import { getControl, getCapabilities, getLifecycleHistory, getTools, addToolMapping, removeToolMappingByToolAndControl } from '../../api';
import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { ToolGrid } from '../tool/ToolGrid';
import { ToolCard } from '../tool/ToolCard';
import { ToolForm } from '../tool/ToolForm';
import { EvidenceSection } from './EvidenceSection';
import { NotesSection } from './NotesSection';
import { LifecycleTimeline } from '../control/LifecycleTimeline';
import { ControlForm } from '../control/ControlForm';
import { useAuth } from '../../context/AuthContext';

// ── Risk level badge ───────────────────────────────────────────────────────────
const RiskBadge = ({ level }) => {
  if (!level) return null;
  const map = {
    High:   'bg-red-50 text-red-600 border-red-200',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200',
    Low:    'bg-green-50 text-green-600 border-green-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[level] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {level} Risk
    </span>
  );
};

// ── Chip ──────────────────────────────────────────────────────────────────────
const Chip = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-center gap-2 bg-white/60 border border-white/40 rounded-lg px-3 py-2">
      {Icon && <Icon size={13} className="text-[#94A3B8] shrink-0" />}
      <div>
        <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-[#334155]">{value}</p>
      </div>
    </div>
  ) : null;

// ── Date formatter ─────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

// ─────────────────────────────────────────────────────────────────────────────
export const ControlDetail = ({ controlId }) => {
  const [control, setControl]       = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [editOpen, setEditOpen]     = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddTool, setShowAddTool] = useState(false);
  const [allTools, setAllTools] = useState([]);
  const [mappingTool, setMappingTool] = useState(false);
  const [selectedToolToAdd, setSelectedToolToAdd] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchControl = useCallback(async (showLoader = true) => {
    if (!controlId) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      // First fetch the control
      const ctrlRes = await getControl(controlId);
      if (!ctrlRes.data?.success) {
        setError('Control not found.');
        return;
      }
      
      const controlData = ctrlRes.data.data;
      setControl(controlData);
      
      // Then fetch capabilities using the control's strategyId (if it has one)
      if (controlData.strategyId) {
        const capRes = await getCapabilities(controlData.strategyId);
        if (capRes.data?.success) {
          setCapabilities(capRes.data.data);
        }
      } else {
        // Fallback to empty if no strategyId
        setCapabilities([]);
      }
    } catch {
      setError('Failed to load control details.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [controlId]);

  useEffect(() => { fetchControl(); }, [fetchControl]);

  const fetchHistory = async () => {
    try {
      const res = await getLifecycleHistory(controlId);
      setHistory(res.data.data || []);
    } catch {
      // non-fatal
    }
  };

  const handleHistoryToggle = () => {
    if (!showHistory) fetchHistory();
    setShowHistory(v => !v);
  };

  const handleAddToolClick = async () => {
    setShowAddTool(!showAddTool);
    setSelectedToolToAdd('');
    if (!showAddTool && allTools.length === 0) {
      try {
        const res = await getTools();
        if (res.data?.success) setAllTools(res.data.data);
      } catch (err) {
        console.error("Failed to fetch tools", err);
      }
    }
  };

  const handleToolSelectChange = (e) => {
    setSelectedToolToAdd(e.target.value);
  };

  const handleToolAddSubmit = async () => {
    if (!selectedToolToAdd) return;
    
    setMappingTool(true);
    try {
      await addToolMapping({
        toolId: selectedToolToAdd,
        controlId: control._id || control.controlId, // Use the correct ID for the DB
        verified: true
      });
      
      // Optimistically update the UI to make it feel real-time
      const newlyAddedTool = allTools.find(t => t._id === selectedToolToAdd);
      if (newlyAddedTool) {
        setControl(prev => ({
          ...prev,
          tools: [...(prev.tools || []), newlyAddedTool]
        }));
      }

      setShowAddTool(false);
      setSelectedToolToAdd('');
      
      // Refresh in the background without showing a spinner
      fetchControl(false); 
    } catch (err) {
      console.error("Failed to map tool", err);
      alert('Failed to map tool.');
    } finally {
      setMappingTool(false);
    }
  };

  const handleDeleteTool = async (tool) => {
    if (!window.confirm(`Remove ${tool.name || tool.toolName} from this control?`)) return;
    try {
      await removeToolMappingByToolAndControl(tool._id, control._id || control.controlId);
      
      // Optimistic update
      setControl(prev => ({
        ...prev,
        tools: prev.tools.filter(t => t._id !== tool._id)
      }));
      
      fetchControl(false);
    } catch (err) {
      console.error(err);
      alert('Failed to remove tool.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  if (error || !control) return <EmptyState message={error || 'Select a control to view details.'} />;

  const displayTitle = control.title || control.controlName || '';
  const displayDesc  = control.description || control.controlDescription || '';
  const displayCategory = control.category || control.controlDomain || '';
  const ownerName    = control.ownerId?.fullName || control.owner || null;

  return (
    <div className="p-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl h-full overflow-y-auto">

      {/* ── Header ── */}
      <div className="mb-4 flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <IDTag id={control.controlId} />
            {control.priority   && <Badge label={control.priority}   type="priority" />}
            {control.riskLevel  && <RiskBadge level={control.riskLevel} />}
            {control.atRisk     && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                <AlertTriangle size={11} /> At Risk
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#0D1514] mb-2">{displayTitle}</h2>
          {displayDesc && (
            <p className="text-[#64748B] text-sm leading-relaxed">{displayDesc}</p>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl
                       border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors shrink-0"
          >
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      {/* ── Lifecycle Timeline ── */}
      <LifecycleTimeline
        control={control}
        isAdmin={isAdmin}
        onUpdated={(updated) => setControl(updated)}
      />

      {/* ── Meta chips ── */}
      {(displayCategory || ownerName || control.riskLevel) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Chip icon={Tag}  label="Category" value={displayCategory} />
          <Chip icon={User} label="Owner"    value={ownerName} />
          {control.controlObjective && (
            <div className="col-span-2 sm:col-span-3 bg-white/60 border border-white/40 rounded-lg px-3 py-2">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-1">Objective</p>
              <p className="text-sm text-[#334155]">{control.controlObjective}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tools ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#334155]">Linked Tools</h3>
            {isAdmin && <span className="text-[10px] text-red-500 font-mono">(Debug: {control.tools?.length || 0} tools)</span>}
          </div>
          {isAdmin && (
            <button 
              onClick={handleAddToolClick}
              className="flex items-center gap-1 text-xs font-semibold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
            >
              <Plus size={14} /> Add Tool
            </button>
          )}
        </div>
        
        {showAddTool && isAdmin && (
          <div className="mb-4 bg-white/60 p-3 rounded-lg border border-[#E2E8F0]">
            <label className="block text-xs font-semibold text-[#64748B] mb-1">Select tool to map</label>
            <div className="flex gap-2">
              <select 
                className="flex-1 text-sm border border-[#E2E8F0] rounded-md px-3 py-2 bg-white"
                onChange={handleToolSelectChange}
                value={selectedToolToAdd}
                disabled={mappingTool}
              >
                <option value="" disabled>-- Select a Tool --</option>
                {allTools.filter(t => !control.tools?.find(ct => (ct._id === t._id || ct.toolId === t._id))).map(t => (
                  <option key={t._id} value={t._id}>{t.name || t.toolName}</option>
                ))}
              </select>
              <button 
                onClick={handleToolAddSubmit}
                disabled={!selectedToolToAdd || mappingTool}
                className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {control.tools && control.tools.length > 0 ? (
          <ToolGrid>
            {control.tools.map((tool, i) => (
              <ToolCard 
                key={tool._id || `${tool.toolId}-${i}`} 
                tool={tool} 
                isAdmin={isAdmin} 
                onEdit={() => setEditingTool(tool)}
                onDelete={() => handleDeleteTool(tool)}
              />
            ))}
          </ToolGrid>
        ) : (
          <p className="text-sm text-[#94A3B8]">No tools mapped to this control.</p>
        )}
      </div>

      <hr className="border-white/50 my-4" />

      {/* ── Evidence ── */}
      <EvidenceSection controlId={control.controlId} />

      {/* ── Notes ── */}
      <NotesSection 
        control={control} 
        onNotesChanged={(newNotes) => {
          setControl(prev => ({
            ...prev,
            notes: newNotes
          }));
        }}
      />

      {/* ── Lifecycle History (collapsible) ── */}
      <div className="mt-6">
        <button
          onClick={handleHistoryToggle}
          className="flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#334155] transition-colors"
        >
          <History size={14} />
          Lifecycle History
          {showHistory ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {showHistory && (
          <div className="mt-3 overflow-hidden rounded-xl border border-[#F1F5F9]">
            {history.length === 0 ? (
              <p className="text-sm text-[#94A3B8] p-4">No lifecycle history available.</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    {['Stage', 'Changed By', 'Date', 'Reason'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[#94A3B8] font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {[...history].reverse().map((entry, i) => (
                    <tr key={i} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-2.5 font-medium text-[#334155]">{entry.stage}</td>
                      <td className="px-4 py-2.5 text-[#64748B]">{entry.changedBy?.fullName || '—'}</td>
                      <td className="px-4 py-2.5 text-[#64748B] whitespace-nowrap">{fmt(entry.changedAt)}</td>
                      <td className="px-4 py-2.5 text-[#94A3B8] italic">{entry.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── Control Edit Modal ── */}
      <ControlForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        control={control}
        capabilities={capabilities}
        onSaved={(updated) => { setControl(updated); fetchControl(); }}
      />

      {/* ── Tool Edit Modal ── */}
      <ToolForm
        isOpen={!!editingTool}
        onClose={() => setEditingTool(null)}
        tool={editingTool}
        onSaved={() => fetchControl()}
      />
    </div>
  );
};
