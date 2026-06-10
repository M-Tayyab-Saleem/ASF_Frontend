export const EmptyState = ({ message = 'No data available.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-text-muted border border-dashed border-border rounded-lg bg-surface-1">
      <p>{message}</p>
    </div>
  );
};
