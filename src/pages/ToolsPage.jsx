import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Shield, Activity, Target } from 'lucide-react';
import { getTools, setToolEffectiveness } from '../api';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/shared/Breadcrumb';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { ToolForm } from '../components/tool/ToolForm';

const STATUS_COLORS = {
  'Active': 'bg-green-50 text-green-700 border border-green-200',
  'Under Evaluation': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Decommissioned': 'bg-slate-100 text-slate-600 border border-slate-200'
};

export const ToolsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await getTools();
      if (res.data?.success) setTools(res.data.data);
    } catch (err) {
      setError('Failed to load tools inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTools(); }, []);

  const handleEdit = (tool) => {
    setEditingTool(tool);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingTool(null);
    setFormOpen(true);
  };

  const handleEffectivenessChange = async (toolId, score) => {
    if (!isAdmin) return;
    try {
      const numericScore = score === '' ? null : Number(score);
      if (numericScore !== null && (numericScore < 0 || numericScore > 100)) return;
      
      const res = await setToolEffectiveness(toolId, numericScore);
      if (res.data?.success) {
        setTools(prev => prev.map(t => t._id === toolId || t.toolId === toolId ? { ...t, effectivenessScore: numericScore } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tools.filter(t => 
    (t.name || t.toolName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.toolId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category || t.toolCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.vendor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Tool Inventory' }]} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1514]">Tool Inventory</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage security tools, statuses, and effectiveness</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8F0] bg-white/60 backdrop-blur-sm text-sm focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10 outline-none transition-all"
            />
          </div>
          {isAdmin && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#00B097] hover:bg-[#009B85] text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
            >
              <Plus size={16} /> Add Tool
            </button>
          )}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-glass overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
        ) : error ? (
          <EmptyState message={error} icon={Shield} />
        ) : filtered.length === 0 ? (
          <EmptyState message="No tools found." icon={Shield} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Tool</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Owner</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Coverage</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Effectiveness</th>
                  {isAdmin && <th className="py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map(tool => (
                  <tr key={tool._id || tool.toolId} className="hover:bg-white/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#0D1514]">{tool.name || tool.toolName}</div>
                      <div className="text-xs text-[#94A3B8] font-mono mt-0.5">{tool.toolId} {tool.vendor && `• ${tool.vendor}`}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#334155]">{tool.category || tool.toolCategory || 'Other'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[tool.status] || STATUS_COLORS['Active']}`}>
                        {tool.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#64748B]">{tool.ownerId?.fullName || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-[#00B097]" />
                        <span className="text-sm font-medium text-[#334155]">{tool.coverageScore || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isAdmin ? (
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-[#6366F1]" />
                          <input 
                            type="number" 
                            min="0" max="100"
                            placeholder="N/A"
                            value={tool.effectivenessScore ?? ''}
                            onChange={(e) => handleEffectivenessChange(tool._id || tool.toolId, e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-[#E2E8F0] rounded bg-white focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none"
                          />
                          <span className="text-xs text-[#94A3B8]">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-[#6366F1]" />
                          <span className="text-sm font-medium text-[#334155]">
                            {tool.effectivenessScore !== null && tool.effectivenessScore !== undefined ? `${tool.effectivenessScore}%` : 'N/A'}
                          </span>
                        </div>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(tool)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#0D1514] hover:bg-[#F1F5F9] rounded transition-colors"
                          title="Edit Tool"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToolForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        tool={editingTool}
        onSaved={() => fetchTools()}
      />
    </div>
  );
};
