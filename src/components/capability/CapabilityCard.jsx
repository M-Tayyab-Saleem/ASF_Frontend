import { IDTag } from '../shared/IDTag';

export const CapabilityCard = ({ capability, isActive, onClick }) => {
  if (!capability) return null;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left flex items-start gap-3 p-3 rounded transition-colors
        ${isActive
          ? 'bg-primary-light border-l-[3px] border-l-primary'
          : 'hover:bg-surface-2 border-l-[3px] border-transparent'
        }
      `}
    >
      <div className="mt-0.5">
        <IDTag id={capability.capabilityId} />
      </div>
      <span className="text-sm font-medium text-text-primary">
        {capability.capabilityName}
      </span>
    </button>
  );
};
