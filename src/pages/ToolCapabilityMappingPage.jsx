import { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Unlink, Shield, ArrowRight, Loader2, Target, CheckCircle2, Plus } from 'lucide-react';
import { getTools, getCapabilities, getCapabilityToolMappings, addCapabilityToolMapping, removeCapabilityToolMapping } from '../api';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/shared/Breadcrumb';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export const ToolCapabilityMappingPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [tools, setTools] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [mappings, setMappings] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(false);
  
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolSearch, setToolSearch] = useState('');
  const [showAddCapability, setShowAddCapability] = useState(false);
  const [selectedCapabilityToAdd, setSelectedCapabilityToAdd] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Need to fetch capabilities for all strategies or just generally
      // We can fetch all capabilities by fetching them per strategy, or we might need an endpoint to get all capabilities.
      // Let's assume getCapabilities works without strategyId or we just use it.
      // Wait, getCapabilities requires a strategyId in the API?
      // Let's fetch all strategies then all capabilities
      const [tRes, mRes] = await Promise.all([
        getTools(), getCapabilityToolMappings()
      ]);
      if (tRes.data?.success) setTools(tRes.data.data);
      if (mRes.data?.success) setMappings(mRes.data.data);

      // Hack to fetch all capabilities: The backend getCapabilities requires strategyId.
      // But maybe we can fetch all controls and extract capabilities? 
      // Better yet, update backend `getCapabilities` to not require strategyId if not provided.
      // Assuming getCapabilities() without args might return all if we update the backend.
      // Let's just try getCapabilities().
      const cRes = await getCapabilities(''); 
      if (cRes.data?.success) setCapabilities(cRes.data.data);

    } catch (err) {
      setError('Failed to load mapping data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleMapping = async (capabilityId) => {
    if (!isAdmin || !selectedTool || working) return;
    setWorking(true);
    
    const existing = mappings.find(m => 
      (m.toolId._id === selectedTool._id || m.toolId === selectedTool._id) && 
      (m.capabilityId._id === capabilityId || m.capabilityId === capabilityId)
    );

    try {
      if (existing) {
        await removeCapabilityToolMapping(existing._id);
        setMappings(prev => prev.filter(m => m._id !== existing._id));
      } else {
        const res = await addCapabilityToolMapping({ toolId: selectedTool._id, capabilityId, verified: true });
        if (res.data?.success) {
          const newMapping = {
            _id: res.data.data.mapping._id,
            toolId: selectedTool,
            capabilityId: capabilities.find(c => c._id === capabilityId),
            verified: true
          };
          setMappings(prev => [...prev, newMapping]);
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update mapping.');
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    setShowAddCapability(false);
    setSelectedCapabilityToAdd('');
  }, [selectedTool]);

  const handleCapabilityAddSubmit = async () => {
    if (!selectedCapabilityToAdd) return;
    await handleToggleMapping(selectedCapabilityToAdd);
    setShowAddCapability(false);
    setSelectedCapabilityToAdd('');
  };

  const filteredTools = tools.filter(t => 
    (t.name || t.toolName || '').toLowerCase().includes(toolSearch.toLowerCase())
  );
  
  const mappedCapabilities = capabilities.filter(c => 
    mappings.some(m => 
      (m.toolId._id === selectedTool?._id || m.toolId === selectedTool?._id) && 
      (m.capabilityId._id === c._id || m.capabilityId === c._id)
    )
  );

  const unmappedCapabilities = capabilities.filter(c => 
    !mappings.some(m => 
      (m.toolId._id === selectedTool?._id || m.toolId === selectedTool?._id) && 
      (m.capabilityId._id === c._id || m.capabilityId === c._id)
    )
  );

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="shrink-0">
        <Breadcrumb items={[{ label: 'Capability Mapping' }]} />
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-[#0D1514]">Capability-Tool Mapping</h1>
          <p className="text-[#64748B] text-sm mt-1">Map security tools directly to the capabilities they provide.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-500">{error}</div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
          
          {/* Left Panel: Tools */}
          <div className="md:col-span-4 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-glass flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-[#F1F5F9] shrink-0 bg-[#F8FAFC]/50">
              <h2 className="font-semibold text-[#0D1514] flex items-center gap-2 mb-3">
                <Target size={16} className="text-[#00B097]"/> Select a Tool
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text" placeholder="Search tools..."
                  value={toolSearch} onChange={(e) => setToolSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:border-[#00B097] outline-none"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTools.map(t => {
                const isSelected = selectedTool?._id === t._id;
                const mappingCount = mappings.filter(m => m.toolId._id === t._id || m.toolId === t._id).length;
                return (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTool(t)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                      isSelected ? 'bg-[#00B097] text-white shadow-md' : 'hover:bg-white/80 text-[#334155]'
                    }`}
                  >
                    <div>
                      <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-[#0D1514]'}`}>
                        {t.name || t.toolName}
                      </div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#94A3B8]'}`}>
                        {t.category || t.toolCategory}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                      {mappingCount} mapped
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Arrow (Desktop only) */}
          <div className="hidden md:flex md:col-span-1 justify-center items-center text-[#CBD5E1]">
            <ArrowRight size={24} />
          </div>

          {/* Right Panel: Capabilities */}
          <div className="md:col-span-7 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-glass flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-[#F1F5F9] shrink-0 bg-[#F8FAFC]/50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-[#0D1514] flex items-center gap-2">
                  <Shield size={16} className="text-[#6366F1]"/> 
                  {selectedTool ? `Capabilities mapped to ${selectedTool.name || selectedTool.toolName}` : 'Select a tool to map capabilities'}
                </h2>
                {selectedTool && isAdmin && (
                  <button 
                    onClick={() => setShowAddCapability(!showAddCapability)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#00B097] hover:text-[#009681] transition-colors"
                  >
                    <Plus size={14} /> Add Capability
                  </button>
                )}
              </div>

              {showAddCapability && selectedTool && isAdmin && (
                <div className="bg-white/60 p-3 rounded-lg border border-[#E2E8F0] mb-2">
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Select capability to map</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 text-sm border border-[#E2E8F0] rounded-md px-3 py-2 bg-white"
                      onChange={(e) => setSelectedCapabilityToAdd(e.target.value)}
                      value={selectedCapabilityToAdd}
                      disabled={working}
                    >
                      <option value="" disabled>-- Select a Capability --</option>
                      {unmappedCapabilities.map(c => (
                        <option key={c._id} value={c._id}>{c.capabilityId} - {c.capabilityName}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleCapabilityAddSubmit}
                      disabled={!selectedCapabilityToAdd || working}
                      className="px-4 py-2 bg-[#00B097] hover:bg-[#009681] text-white text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!selectedTool ? (
                <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] space-y-3">
                  <Target size={48} className="opacity-20" />
                  <p className="text-sm">Select a tool from the left panel to manage its capability mappings.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mappedCapabilities.length === 0 ? (
                    <p className="text-sm text-[#94A3B8] text-center mt-8">No capabilities mapped to this tool.</p>
                  ) : (
                    mappedCapabilities.map(c => (
                      <div key={c._id} className="flex items-center justify-between p-3 rounded-xl border transition-all border-[#00B097]/30 bg-[#E6F7F5]/50">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-[#64748B]">{c.capabilityId}</span>
                            <span className="text-sm font-medium text-[#0D1514] truncate">{c.capabilityName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              {c.capabilityCategory || 'Uncategorized'}
                            </span>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => handleToggleMapping(c._id)}
                            disabled={working}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white text-red-600 border border-red-200 hover:bg-red-50"
                          >
                            {working ? <Loader2 size={14} className="animate-spin" /> : <><Unlink size={14}/> Remove</>}
                          </button>
                        )}
                        {!isAdmin && (
                           <span className="text-xs text-[#00B097] flex items-center gap-1 font-medium"><CheckCircle2 size={14}/> Mapped</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};
