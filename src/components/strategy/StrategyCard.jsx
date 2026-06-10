import { IDTag } from '../shared/IDTag';

export const StrategyCard = ({ strategy, isActive, onClick }) => {
  if (!strategy) return null;

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-lg p-6 transition-all duration-150 ease-in-out
        ${isActive 
          ? 'bg-[#141008] border-l-[3px] border-l-gold border-y border-r border-y-border border-r-border' 
          : 'bg-surface-1 border border-border hover:bg-surface-2 hover:border-border-gold'
        }
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <IDTag id={strategy.strategyId} />
        {strategy.capabilityCount > 0 && (
          <span className="text-xs text-text-secondary bg-surface-3 px-2 py-1 rounded">
            {strategy.capabilityCount} caps
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-light text-text-primary mb-2">
        {strategy.strategyName}
      </h3>
      
      <p className="text-sm text-text-secondary line-clamp-2">
        {strategy.strategyDescription}
      </p>
    </div>
  );
};
