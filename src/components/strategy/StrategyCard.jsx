import { IDTag } from '../shared/IDTag';

export const StrategyCard = ({ strategy, isActive, onClick }) => {
  if (!strategy) return null;

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-lg p-6 transition-all duration-150 ease-in-out
        ${isActive 
          ? 'bg-primary-light border-l-[3px] border-l-primary border-y border-r border-y-border border-r-border' 
          : 'bg-white border border-border hover:bg-surface-1 hover:border-primary'
        }
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <IDTag id={strategy.strategyId} />
        {strategy.capabilityCount > 0 && (
          <span className="text-xs text-text-secondary bg-surface-2 px-2 py-1 rounded">
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
