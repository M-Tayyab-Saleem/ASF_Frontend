import { IDTag } from '../shared/IDTag';

export const CapabilityCard = ({ capability, isActive, onClick }) => {
  if (!capability) return null;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left flex flex-col gap-2 p-3 rounded-xl transition-all duration-300
        ${isActive
          ? 'bg-white/90 backdrop-blur-md border border-[#00B097] shadow-sm'
          : 'bg-white/40 backdrop-blur-sm border border-transparent hover:bg-white/60 hover:border-slate-200 cursor-pointer'
        }
      `}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="mt-0.5">
          <IDTag id={capability.capabilityId} />
        </div>
        <span className="text-sm font-medium text-slate-800 flex-1 leading-snug">
          {capability.capabilityName}
        </span>
      </div>
      
      {capability.totalControls === 0 ? (
        <div className="w-full mt-1 text-[10px] text-slate-400 italic">
          No controls mapped
        </div>
      ) : capability.progress !== undefined && capability.progress !== null ? (
        <div className="w-full mt-1">
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="text-slate-500 font-medium">Implementation</span>
            <span className="text-[#00B097] font-bold">{capability.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00B097] transition-all duration-500"
              style={{ width: `${capability.progress}%` }}
            />
          </div>
        </div>
      ) : null}
    </button>
  );
};
