import { useState, useEffect } from 'react';
import { getCapability } from '../../api';
import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { CollapsibleControlRow } from './CollapsibleControlRow';

export const CapabilityDetail = ({ capabilityId }) => {
  const [capability, setCapability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!capabilityId) return;

    const fetchDetail = async () => {
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
    <div className="p-6 bg-surface-1 rounded-lg border border-border h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <IDTag id={capability.capabilityId} />
          <Badge label={capability.capabilityCategory} type="status" />
        </div>
        <h2 className="text-2xl font-light text-text-primary mb-4">
          <span className="text-gold mr-2">{capability.capabilityName}</span>
        </h2>
        {capability.capabilityDescription && (
          <p className="text-text-secondary leading-relaxed">
            {capability.capabilityDescription}
          </p>
        )}
      </div>

      <hr className="border-border my-6" />

      <h3 className="text-lg font-medium text-text-primary mb-4">Controls</h3>
      
      {capability.controls && capability.controls.length > 0 ? (
        <div className="flex flex-col gap-3">
          {capability.controls.map((control) => (
            <CollapsibleControlRow key={control.controlId} control={control} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No controls mapped</p>
      )}
    </div>
  );
};
