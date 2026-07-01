import { useState, useEffect } from 'react';
import { getControl } from '../../api';
import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { ToolGrid } from '../tool/ToolGrid';
import { ToolCard } from '../tool/ToolCard';
import { EvidenceSection } from './EvidenceSection';
import { StatusUpdate } from './StatusUpdate';
import { useAuth } from '../../context/AuthContext';

export const ControlDetail = ({ controlId }) => {
  const [control, setControl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!controlId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getControl(controlId);
        if (response.data && response.data.success) {
          setControl(response.data.data);
        } else {
          setError('Control not found.');
        }
      } catch (err) {
        console.error('Error fetching control detail:', err);
        setError('Failed to load control details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [controlId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !control) {
    return <EmptyState message={error || "Select a control to view details."} />;
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-border h-full overflow-y-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <IDTag id={control.controlId} />
            {control.priority && <Badge label={control.priority} type="priority" />}
            {control.status && <Badge label={control.status} type="status" />}
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            <span className="text-primary mr-2">{control.controlName}</span>
          </h2>
          {control.controlDescription && (
            <p className="text-text-secondary leading-relaxed mb-4">
              {control.controlDescription}
            </p>
          )}
          {control.controlObjective && (
            <div className="mb-4">
              <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1 font-semibold">Objective</h5>
              <p className="text-sm text-text-secondary">{control.controlObjective}</p>
            </div>
          )}
        </div>
        
        {isAdmin && (
          <div className="shrink-0 ml-4">
            <StatusUpdate 
              controlId={control.controlId} 
              currentStatus={control.status}
              onStatusUpdate={(newStatus) => setControl({ ...control, status: newStatus })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-surface-1 p-4 rounded-lg border border-border">
        {control.controlDomain && (
          <div>
            <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1 font-semibold">Domain</h5>
            <p className="text-sm text-text-secondary">{control.controlDomain}</p>
          </div>
        )}
        {control.owner && (
          <div>
            <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1 font-semibold">Owner</h5>
            <p className="text-sm text-text-secondary">{control.owner}</p>
          </div>
        )}
        {control.lifecycleStage && (
          <div>
            <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1 font-semibold">Lifecycle Stage</h5>
            <p className="text-sm text-text-secondary">{control.lifecycleStage}</p>
          </div>
        )}
        {control.implementationState && (
          <div>
            <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1 font-semibold">Implementation</h5>
            <p className="text-sm text-text-secondary">{control.implementationState}</p>
          </div>
        )}
      </div>

      <hr className="border-border my-6" />

      <h3 className="text-lg font-medium text-text-primary mb-4">Tools</h3>
      
      {control.tools && control.tools.length > 0 ? (
        <ToolGrid>
          {control.tools.map((tool, index) => (
            <ToolCard key={tool._id || tool.toolId + '-' + index} tool={tool} />
          ))}
        </ToolGrid>
      ) : (
        <p className="text-sm text-text-muted">No tools mapped</p>
      )}

      <EvidenceSection controlId={control.controlId} />
    </div>
  );
};
