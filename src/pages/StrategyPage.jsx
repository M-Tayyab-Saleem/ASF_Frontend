import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStrategy, getCapabilities, getControls } from '../api';
import { useAppContext } from '../context/AppContext';
import { Breadcrumb } from '../components/shared/Breadcrumb';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { CapabilityList } from '../components/capability/CapabilityList';
import { ControlList } from '../components/control/ControlList';
import { CapabilityDetail } from '../components/detail/CapabilityDetail';
import { ControlDetail } from '../components/detail/ControlDetail';

export const StrategyPage = () => {
  const { strategyId, type, itemId } = useParams();
  const navigate = useNavigate();
  const { state: appState, updateState } = useAppContext();

  const [strategy, setStrategy] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="bg-[#0A0A0A] min-h-screen p-6 flex flex-col max-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 pb-6">
          {/* Left Panel - List View */}
          <div className="w-full md:w-[30%] flex flex-col min-h-0 bg-surface-1 border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'capabilities'
                    ? 'text-gold border-b-2 border-gold bg-[#141008]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
                onClick={() => handleTabChange('capabilities')}
              >
                Capabilities
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'controls'
                    ? 'text-gold border-b-2 border-gold bg-[#141008]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
                onClick={() => handleTabChange('controls')}
              >
                Controls
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
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
            ) : (
              <div className="flex-1 bg-surface-1 border border-border rounded-lg flex items-center justify-center p-8 text-center">
                <p className="text-text-muted">
                  Select a capability or control from the left
                </p>
              </div>
            )}
          </div>
          
          {/* Mobile Detail Overlay */}
          {itemId && (
             <div className="md:hidden fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col p-6">
                <button 
                  onClick={() => navigate(`/strategy/${strategyId}`)}
                  className="mb-4 text-gold"
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
    </div>
  );
};
