import { IDTag } from '../shared/IDTag';
import { Badge } from '../shared/Badge';

export const ControlCard = ({ control, isActive, onClick }) => {
  if (!control) return null;

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
