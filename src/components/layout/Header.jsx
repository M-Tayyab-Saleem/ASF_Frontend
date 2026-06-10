import { useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchModal } from './SearchModal';

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-[#0A0A0A] border-b border-border h-[60px] sticky top-0 z-50 flex items-center px-6">
        <div className="flex items-center w-full max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <span className="font-mono text-gold font-bold text-xl tracking-wider">
              [ ASF ]
            </span>
            <span className="text-text-muted text-sm hidden sm:block">
              AI Security Framework Explorer
            </span>
          </Link>
          <div className="ml-auto">
            <button 
              className="text-text-muted hover:text-gold transition-colors p-2"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
