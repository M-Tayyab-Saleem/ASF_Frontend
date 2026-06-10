export const IDTag = ({ id }) => {
  if (!id) return null;
  return (
    <span className="font-mono text-xs bg-surface-2 text-gold px-2 py-0.5 rounded border border-border inline-block">
      {id}
    </span>
  );
};
