export const IDTag = ({ id }) => {
  if (!id) return null;
  return (
    <span className="font-mono text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded border border-primary inline-block">
      {id}
    </span>
  );
};
