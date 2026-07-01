const priorityColors = {
  High: 'text-status-notImplemented bg-status-notImplementedBg border-status-notImplemented',
  Medium: 'text-status-pending bg-status-pendingBg border-status-pending',
  Low: 'text-text-secondary bg-surface-2 border-border',
};

const statusColors = {
  Implemented: 'text-status-implemented bg-status-implementedBg border-status-implemented',
  'Not Implemented': 'text-status-notImplemented bg-status-notImplementedBg border-status-notImplemented',
  Pending: 'text-status-pending bg-status-pendingBg border-status-pending',
};

export const Badge = ({ label, type = 'priority' }) => {
  if (!label) return null;

  const colorClass =
    type === 'priority'
      ? priorityColors[label] || priorityColors.Low
      : statusColors[label] || statusColors.Pending;

  return (
    <span
      className={`rounded-full text-xs px-2 py-0.5 border font-mono whitespace-nowrap ${colorClass}`}
    >
      {label}
    </span>
  );
};
