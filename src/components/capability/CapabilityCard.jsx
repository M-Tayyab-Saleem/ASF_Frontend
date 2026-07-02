import { IDTag } from '../shared/IDTag';

export const CapabilityCard = ({ capability, isActive, onClick }) => {
  if (!capability) return null;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-300
        ${isActive
          ? 'bg-white/90 backdrop-blur-md border border-primary shadow-sm'
          : 'bg-white/40 backdrop-blur-sm border border-transparent hover:bg-white/60 hover:border-white/50 cursor-pointer'
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
