import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';

export const ControlCard = ({ control, isActive, onClick }) => {
  if (!control) return null;

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
      <div className="flex flex-col gap-1 flex-1">
        <span className="text-sm font-medium text-text-primary">
          {control.controlName}
        </span>
        <div className="flex gap-2">
          {control.priority && <Badge label={control.priority} type="priority" />}
          {control.status && <Badge label={control.status} type="status" />}
        </div>
      </div>
    </button>
  );
};
