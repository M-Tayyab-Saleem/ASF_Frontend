import { Badge } from '../shared/Badge';

export const ToolCard = ({ tool }) => {
  if (!tool) return null;

  return (
    <div className="bg-[#1A1A1A] border border-border rounded-lg p-4 hover:border-border-gold transition-colors duration-150">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-text-primary text-base">
          {tool.toolName}
        </h4>
        <Badge label={tool.toolCategory} type="status" />
      </div>
      
      {tool.vendor && (
        <div className="text-sm text-text-secondary mb-3">
          {tool.vendor}
        </div>
      )}

      <hr className="border-border my-3" />

      {tool.primaryFunction && (
        <div className="mb-3">
          <div className="text-text-muted text-xs uppercase tracking-wider mb-1">
            Primary Function
          </div>
          <div className="text-sm text-text-secondary">
            {tool.primaryFunction}
          </div>
        </div>
      )}

      {tool.aiControlRelevance && (
        <div>
          <div className="text-text-muted text-xs uppercase tracking-wider mb-1">
            AI Control Relevance
          </div>
          <div className="text-sm text-text-secondary">
            {tool.aiControlRelevance}
          </div>
        </div>
      )}
    </div>
  );
};
