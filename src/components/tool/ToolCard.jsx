import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../shared/Badge';

export const ToolCard = ({ tool, isAdmin, onEdit, onDelete }) => {
  if (!tool) return null;

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:border-primary/50 shadow-sm hover:shadow-glass hover:bg-white/80 transition-all duration-300 relative group">
      {isAdmin && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(tool); }}
              className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#94A3B8] hover:text-[#0D1514] hover:bg-[#F1F5F9]"
              title="Edit Tool"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(tool); }}
              className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#94A3B8] hover:text-red-600 hover:bg-red-50"
              title="Delete Tool"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
      <div className="flex justify-between items-start mb-2 gap-3 pr-8">
        <h4 className="font-bold text-text-primary text-base flex-1 min-w-0 pr-2">
          {tool.name || tool.toolName}
        </h4>
        <div className="shrink-1 min-w-0 flex justify-end">
          <Badge label={tool.category || tool.toolCategory} type="status" className="truncate inline-block max-w-full" />
        </div>
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
