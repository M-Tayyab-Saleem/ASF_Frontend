import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';

const STAGE_COLORS = {
  'Defined':        'bg-slate-100 text-slate-500',
  'Implemented':    'bg-[#E6F7F5] text-[#007A68]',
  'Evidence Added': 'bg-indigo-50 text-indigo-600',
  'Validated':      'bg-green-50 text-green-600',
  'Review':         'bg-amber-50 text-amber-600',
};

export const ControlCard = ({ control, isActive, onClick }) => {
  if (!control) return null;

  const stage = control.lifecycleStage;
  const stageColor = stage ? (STAGE_COLORS[stage] || 'bg-slate-100 text-slate-500') : null;

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
        <IDTag id={control.controlId} />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {control.title || control.controlName}
        </span>
        <div className="flex flex-wrap gap-1.5 items-center">
          {control.priority && <Badge label={control.priority} type="priority" />}
          {control.atRisk && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-500">At Risk</span>
          )}
          {stage && stageColor && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stageColor}`}>
              {stage}
            </span>
          )}
          {((control.tools && control.tools.length > 0) || (control.linkedTools && control.linkedTools.length > 0)) && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              {control.tools?.length || control.linkedTools?.length}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
