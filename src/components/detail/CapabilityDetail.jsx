import { useState, useEffect } from 'react';
import { Wrench, Plus } from 'lucide-react';
import { getCapability, getTools, addCapabilityToolMapping, removeCapabilityToolMappingByToolAndCapability } from '../../api';
import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { CollapsibleControlRow } from './CollapsibleControlRow';
import { ToolGrid } from '../tool/ToolGrid';
import { ToolCard } from '../tool/ToolCard';
import { ToolForm } from '../tool/ToolForm';
import { useAuth } from '../../context/AuthContext';

export const CapabilityDetail = ({ capabilityId }) => {
  const [capability, setCapability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  
  const [showAddTool, setShowAddTool] = useState(false);
  const [allTools, setAllTools] = useState([]);
  const [mappingTool, setMappingTool] = useState(false);
  const [selectedToolToAdd, setSelectedToolToAdd] = useState('');
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchDetail = async (showLoader = true) => {
    if (!capabilityId) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const response = await getCapability(capabilityId);
      if (response.data && response.data.success) {
        setCapability(response.data.data);
      } else {
        setError('Capability not found.');
      }
    } catch (err) {
      console.error('Error fetching capability detail:', err);
      setError('Failed to load capability details.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [capabilityId]);

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

  const handleToolAddSubmit = async () => {
    if (!selectedToolToAdd) return;
    
    setMappingTool(true);
    try {
      await addCapabilityToolMapping({
        toolId: selectedToolToAdd,
        capabilityId: capability._id, 
        verified: true
      });
      
      const newlyAddedTool = allTools.find(t => t._id === selectedToolToAdd);
      if (newlyAddedTool) {
        setCapability(prev => ({
          ...prev,
          tools: [...(prev.tools || []), newlyAddedTool]
        }));
      }

      setShowAddTool(false);
      setSelectedToolToAdd('');
      
      fetchDetail(false); 
    } catch (err) {
      console.error("Failed to map tool", err);
      alert('Failed to map tool.');
    } finally {
      setMappingTool(false);
    }
  };

  const handleDeleteTool = async (tool) => {
    if (!window.confirm(`Remove ${tool.name || tool.toolName} from this capability?`)) return;
    try {
      await removeCapabilityToolMappingByToolAndCapability(tool._id, capability._id);
      
      setCapability(prev => ({
        ...prev,
        tools: prev.tools.filter(t => t._id !== tool._id)
      }));
      
      fetchDetail(false);
    } catch (err) {
      console.error(err);
      alert('Failed to remove tool.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !capability) {
    return <EmptyState message={error || "Select a capability to view details."} />;
  }

  return (
    <div className="p-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <IDTag id={capability.capabilityId} />
          <Badge label={capability.capabilityCategory} type="status" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          <span className="text-primary mr-2">{capability.capabilityName}</span>
        </h2>
        {capability.capabilityDescription && (
          <p className="text-text-secondary leading-relaxed">
            {capability.capabilityDescription}
          </p>
        )}
      </div>

      <hr className="border-white/50 my-6" />

      {/* ── Tools ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#334155]">Linked Tools</h3>
            {isAdmin && <span className="text-[10px] text-red-500 font-mono">(Debug: {capability.tools?.length || 0} tools)</span>}
          </div>
          {isAdmin && (
            <button 
              onClick={handleAddToolClick}
              className="flex items-center gap-1 text-xs font-semibold text-[#00B097] hover:text-[#009681] transition-colors"
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
                onChange={(e) => setSelectedToolToAdd(e.target.value)}
                value={selectedToolToAdd}
                disabled={mappingTool}
              >
                <option value="" disabled>-- Select a Tool --</option>
                {allTools.filter(t => !capability.tools?.find(ct => (ct._id === t._id || ct.toolId === t._id))).map(t => (
                  <option key={t._id} value={t._id}>{t.name || t.toolName}</option>
                ))}
              </select>
              <button 
                onClick={handleToolAddSubmit}
                disabled={!selectedToolToAdd || mappingTool}
                className="px-4 py-2 bg-[#00B097] hover:bg-[#009681] text-white text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {capability.tools && capability.tools.length > 0 ? (
          <ToolGrid>
            {capability.tools.map((tool, i) => (
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
          <p className="text-sm text-[#94A3B8]">No tools mapped directly to this capability.</p>
        )}
      </div>

      <hr className="border-white/50 my-6" />

      <h3 className="text-lg  text-text-primary mb-4">Controls</h3>
      
      {capability.controls && capability.controls.length > 0 ? (
        <div className="flex flex-col gap-3">
          {capability.controls.map((control) => (
            <CollapsibleControlRow 
              key={control.controlId} 
              control={control} 
              isAdmin={isAdmin} 
              onEditTool={(tool) => setEditingTool(tool)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No controls mapped</p>
      )}

      {/* ── Tool Edit Modal ── */}
      <ToolForm
        isOpen={!!editingTool}
        onClose={() => setEditingTool(null)}
        tool={editingTool}
        onSaved={() => fetchDetail()}
      />
    </div>
  );
};
