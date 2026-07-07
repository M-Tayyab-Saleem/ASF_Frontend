import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';
import { ToolGrid } from '../tool/ToolGrid';
import { ToolCard } from '../tool/ToolCard';

export const CollapsibleControlRow = ({ control, isAdmin, onEditTool }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!control) return null;

  return (
    <div className={`border border-border rounded-lg overflow-hidden transition-colors ${isExpanded ? 'bg-surface-2' : 'bg-surface-1'}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1">
          <IDTag id={control.controlId} />
          <span className="font-medium text-text-primary flex-1">
            {control.controlName}
          </span>
          <Badge label={control.priority} type="priority" />
        </div>
        <ChevronRight
          className={`w-5 h-5 text-text-muted transition-transform duration-150 ml-4 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border bg-white">
          {control.controlDescription && (
            <div className="mb-4">
              <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1">Description</h5>
              <p className="text-sm text-text-secondary">{control.controlDescription}</p>
            </div>
          )}
          
          {control.controlObjective && (
            <div className="mb-4">
              <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1">Objective</h5>
              <p className="text-sm text-text-secondary">{control.controlObjective}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {control.controlDomain && (
              <div>
                <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1">Domain</h5>
                <p className="text-sm text-text-secondary">{control.controlDomain}</p>
              </div>
            )}
            {control.implementationState && (
              <div>
                <h5 className="text-xs uppercase text-text-muted tracking-wider mb-1">Implementation State</h5>
                <p className="text-sm text-text-secondary">{control.implementationState}</p>
              </div>
            )}
          </div>

          <h5 className="text-sm  text-text-primary mb-3">Tools</h5>
          {control.tools && control.tools.length > 0 ? (
            <ToolGrid>
              {control.tools.map((tool) => (
                <ToolCard 
                  key={tool.toolId} 
                  tool={tool} 
                  isAdmin={isAdmin} 
                  onEdit={onEditTool} 
                />
              ))}
            </ToolGrid>
          ) : (
            <p className="text-sm text-text-muted">No tools mapped</p>
          )}
        </div>
      )}
    </div>
  );
};
