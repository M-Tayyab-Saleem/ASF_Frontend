export const Logo = ({ className = "" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={`text-primary drop-shadow-[0_0_8px_rgba(0,176,151,0.8)] ${className}`}
    >
      <path fillRule="evenodd" d="M11.438 1.48a1.5 1.5 0 0 1 1.124 0l8.25 3.3A1.5 1.5 0 0 1 21.75 6.17c0 6.643-3.155 12.637-8.761 15.656a1.5 1.5 0 0 1-1.478 0C5.905 18.807 2.75 12.813 2.75 6.17a1.5 1.5 0 0 1 .938-1.39l8.25-3.3ZM16.72 9.28a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
};
