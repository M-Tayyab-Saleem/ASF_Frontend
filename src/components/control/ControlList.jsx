import { ControlCard } from './ControlCard';
import { EmptyState } from '../shared/EmptyState';

export const ControlList = ({ controls, selectedId, onSelect }) => {
  if (!controls || controls.length === 0) {
    return <EmptyState message="No controls found." />;
  }

  return (
    <div className="flex flex-col gap-2">
      {controls.map((ctrl) => (
        <ControlCard
          key={ctrl.controlId}
          control={ctrl}
          isActive={selectedId === ctrl.controlId}
          onClick={() => onSelect(ctrl.controlId)}
        />
      ))}
    </div>
  );
};
