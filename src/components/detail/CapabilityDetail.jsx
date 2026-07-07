import { useState, useEffect } from 'react';
import { getCapability } from '../../api';
import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { CollapsibleControlRow } from './CollapsibleControlRow';
import { ToolForm } from '../tool/ToolForm';
import { useAuth } from '../../context/AuthContext';

export const CapabilityDetail = ({ capabilityId }) => {
  const [capability, setCapability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchDetail = async () => {
    if (!capabilityId) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [capabilityId]);

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
