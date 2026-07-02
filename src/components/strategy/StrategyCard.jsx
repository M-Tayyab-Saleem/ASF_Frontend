import { IDTag } from '../shared/IDTag';

export const StrategyCard = ({ strategy, isActive, onClick }) => {
  if (!strategy) return null;

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-xl p-6 transition-all duration-300 ease-in-out shadow-glass hover:shadow-glass-hover
        ${isActive 
          ? 'bg-white/90 backdrop-blur-md border border-primary ring-2 ring-primary/20' 
          : 'bg-white/60 backdrop-blur-xl border border-white/40 hover:bg-white/80 hover:border-primary/50'
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
      
      <h3 className="text-lg  text-text-primary mb-2">
        {strategy.strategyName}
      </h3>
      
      <p className="text-sm text-text-secondary line-clamp-2">
        {strategy.strategyDescription}
      </p>
    </div>
  );
};
