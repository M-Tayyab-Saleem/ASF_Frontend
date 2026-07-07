const priorityColors = {
  High: 'text-status-notImplemented bg-status-notImplemented/10 border-status-notImplemented/20',
  Medium: 'text-status-pending bg-status-pending/10 border-status-pending/20',
  Low: 'text-text-secondary bg-surface-2 border-border/50',
};

const statusColors = {
  Implemented: 'text-status-implemented bg-status-implemented/10 border-status-implemented/20',
  'Not Implemented': 'text-status-notImplemented bg-status-notImplemented/10 border-status-notImplemented/20',
  Pending: 'text-status-pending bg-status-pending/10 border-status-pending/20',
};

export const Badge = ({ label, type = 'priority', className = '' }) => {
  if (!label) return null;

  const colorClass =
    type === 'priority'
      ? priorityColors[label] || priorityColors.Low
      : statusColors[label] || statusColors.Pending;

  return (
    <span
      className={`rounded-full text-xs px-2 py-0.5 border font-mono whitespace-nowrap ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
};
