import { Badge } from '../shared/Badge';

export const ToolCard = ({ tool }) => {
  if (!tool) return null;

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:border-primary/50 shadow-sm hover:shadow-glass hover:bg-white/80 transition-all duration-300">
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
