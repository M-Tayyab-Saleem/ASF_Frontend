import { IDTag } from '../shared/IDTag';

export const CapabilityCard = ({ capability, isActive, onClick }) => {
  if (!capability) return null;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left flex items-start gap-3 p-3 rounded transition-colors
        ${isActive
          ? 'bg-[#141008] border-l-2 border-l-gold'
          : 'hover:bg-surface-2 border-l-2 border-transparent'
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
