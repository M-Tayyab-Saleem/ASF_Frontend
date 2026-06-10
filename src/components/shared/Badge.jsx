const priorityColors = {
  High: 'text-gold bg-gold/10 border-gold/30',
  Medium: 'text-[#7A8C6E] bg-[#7A8C6E]/10 border-[#7A8C6E]/30',
  Low: 'text-[#4A5568] bg-[#4A5568]/10 border-[#4A5568]/30',
};

const statusColors = {
  Active: 'text-[#5A8A6A] bg-[#5A8A6A]/10 border-[#5A8A6A]/30',
  Inactive: 'text-[#5A4A4A] bg-[#5A4A4A]/10 border-[#5A4A4A]/30',
  Pending: 'text-gold-muted bg-gold-muted/10 border-gold-muted/30',
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
