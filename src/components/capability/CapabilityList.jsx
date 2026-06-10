import { CapabilityCard } from './CapabilityCard';
import { EmptyState } from '../shared/EmptyState';

export const CapabilityList = ({ capabilities, selectedId, onSelect }) => {
  if (!capabilities || capabilities.length === 0) {
    return <EmptyState message="No capabilities found." />;
  }

  return (
    <div className="flex flex-col gap-2">
      {capabilities.map((cap) => (
        <CapabilityCard
          key={cap.capabilityId}
          capability={cap}
          isActive={selectedId === cap.capabilityId}
          onClick={() => onSelect(cap.capabilityId)}
        />
      ))}
    </div>
  );
};
