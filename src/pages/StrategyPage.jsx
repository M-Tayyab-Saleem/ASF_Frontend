import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getStrategy, getCapabilities, getControls } from '../api';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/shared/Breadcrumb';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { CapabilityList } from '../components/capability/CapabilityList';
import { ControlList } from '../components/control/ControlList';
import { CapabilityDetail } from '../components/detail/CapabilityDetail';
import { ControlDetail } from '../components/detail/ControlDetail';
import { ControlForm } from '../components/control/ControlForm';
import { ControlsOverview } from '../components/control/ControlsOverview';

export const StrategyPage = () => {
  const { strategyId, type, itemId } = useParams();
  const navigate = useNavigate();
  const { state: appState, updateState } = useAppContext();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [strategy, setStrategy] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Sync active tab based on URL param or fallback to Context state
  const activeTab = type === 'control' ? 'controls' : type === 'capability' ? 'capabilities' : appState.selectedTab;

  useEffect(() => {
    const fetchStrategyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [stratRes, capsRes, ctrlsRes] = await Promise.all([
          getStrategy(strategyId),
          getCapabilities(strategyId),
          getControls({ strategyId })
        ]);

        if (stratRes.data?.success) setStrategy(stratRes.data.data);
        if (capsRes.data?.success) setCapabilities(capsRes.data.data);
        if (ctrlsRes.data?.success) setControls(ctrlsRes.data.data);
      } catch (err) {
        console.error('Error fetching strategy data:', err);
        setError('Failed to load strategy details.');
      } finally {
        setLoading(false);
      }
    };

    fetchStrategyData();
  }, [strategyId]);

  const handleTabChange = (tab) => {
    updateState({ selectedTab: tab });
    navigate(`/strategy/${strategyId}`);
  };

  const handleSelectItem = (itemType, id) => {
    navigate(`/strategy/${strategyId}/${itemType}/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="p-6">
        <EmptyState message={error || "Strategy not found."} />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: strategy.strategyName, to: `/strategy/${strategyId}` }
  ];
  if (itemId) {
    breadcrumbItems[0].to = `/strategy/${strategyId}`;
    breadcrumbItems.push({ label: itemId });
  } else {
    delete breadcrumbItems[0].to;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-8">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 pt-8 px-0 sm:px-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 pb-6">
          {/* Left Panel - List View */}
          <div className="w-full md:w-[30%] flex flex-col min-h-0 bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl overflow-hidden">
            <div className="flex border-b border-white/40">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'capabilities'
                    ? 'text-primary border-b-2 border-primary bg-white/50'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/30'
                }`}
                onClick={() => handleTabChange('capabilities')}
              >
                Capabilities
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'controls'
                    ? 'text-primary border-b-2 border-primary bg-white/50'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/30'
                }`}
                onClick={() => handleTabChange('controls')}
              >
                Controls
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'controls' && isAdmin && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="w-full flex items-center justify-center gap-2 mb-3 px-4 py-2 text-xs font-semibold
                             rounded-xl border border-dashed border-[#00B097] text-[#00B097]
                             hover:bg-[#E6F7F5] transition-colors"
                >
                  <Plus size={14} /> Add Control
                </button>
              )}
              {activeTab === 'capabilities' ? (
                <CapabilityList
                  capabilities={capabilities}
                  selectedId={type === 'capability' ? itemId : null}
                  onSelect={(id) => handleSelectItem('capability', id)}
                />
              ) : (
                <ControlList
                  controls={controls}
                  selectedId={type === 'control' ? itemId : null}
                  onSelect={(id) => handleSelectItem('control', id)}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Detail View */}
          <div className="hidden md:flex w-full md:w-[70%] flex-col min-h-0">
            {itemId ? (
              type === 'capability' ? (
                <CapabilityDetail capabilityId={itemId} />
              ) : type === 'control' ? (
                <ControlDetail controlId={itemId} />
              ) : null
            ) : activeTab === 'controls' ? (
              <ControlsOverview strategyId={strategyId} />
            ) : (
              <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl flex items-center justify-center p-8 text-center">
                <p className="text-text-muted">
                  Select a capability from the left
                </p>
              </div>
            )}
          </div>
          
          {/* Mobile Detail Overlay */}
          {itemId && (
             <div className="md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-6">
                <button 
                  onClick={() => navigate(`/strategy/${strategyId}`)}
                  className="mb-4 text-primary"
                >
                   ← Back to List
                </button>
                <div className="flex-1 overflow-y-auto">
                   {type === 'capability' ? (
                     <CapabilityDetail capabilityId={itemId} />
                   ) : type === 'control' ? (
                     <ControlDetail controlId={itemId} />
                   ) : null}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Create Control Modal */}
      <ControlForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        capabilities={capabilities}
        onSaved={(newControl) => {
          setControls(prev => [...prev, newControl]);
          setCreateOpen(false);
          handleSelectItem('control', newControl.controlId);
        }}
      />
    </div>
  );
};
