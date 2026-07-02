import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Dropdown = ({ value, onChange, options, disabled = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If there's less than 250px below and more space above, flip it up
      if (spaceBelow < 250 && rect.top > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full min-w-[140px] bg-white/70 border ${isOpen ? 'border-primary outline outline-2 outline-primary-light' : 'border-border'} rounded-lg px-3 py-1.5 text-sm text-text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="truncate mr-2">{selectedOption?.label}</span>
        <ChevronDown size={16} className={`text-text-muted transition-transform duration-200 ${isOpen ? (openUpwards ? 'rotate-0' : 'rotate-180') : (openUpwards ? 'rotate-180' : '')}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full min-w-[140px] bg-white border border-border rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                option.value === value 
                  ? 'bg-primary-light text-primary font-medium border-l-2 border-primary' 
                  : 'text-text-primary hover:bg-surface-2 border-l-2 border-transparent'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
