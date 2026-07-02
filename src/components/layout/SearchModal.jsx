import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight } from 'lucide-react';
import { search } from '../../api';
import { IDTag } from '../shared/IDTag';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
      // Handle enter key to navigate to first result
      if (e.key === 'Enter' && isOpen && results) {
        const firstType = ['strategies', 'capabilities', 'controls', 'tools'].find(t => results[t]?.length > 0);
        if (firstType) {
          const item = results[firstType][0];
          handleNavigate(firstType.slice(0, -1), item);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await search(query);
        if (res.data?.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (type, item) => {
    onClose();
    if (type === 'strategy') {
      navigate(`/strategy/${item.strategyId}`);
    } else if (type === 'capability') {
      navigate(`/strategy/${item.strategyId}/capability/${item.capabilityId}`);
    } else if (type === 'control') {
      navigate(`/strategy/${item.strategyId}/control/${item.controlId}`);
    } else if (type === 'tool') {
      // If no dedicated page, maybe navigate to strategy list to find it, or simply alert.
      // We will do nothing for tools if they lack strategyId in the item
      console.log('Tool click navigation is not fully supported without a route', item);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-start pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-xl border border-white/40 rounded-xl shadow-glass overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-4 border-b border-border bg-white/50">
          <Search className="text-text-muted mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search strategies, capabilities, controls, tools..."
            className="flex-1 bg-transparent border-none text-text-primary text-lg focus:outline-none placeholder:text-text-muted"
          />
          {loading && <LoadingSpinner />}
          <button 
            onClick={onClose}
            className="ml-3 text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto">
          {!query.trim() && (
            <div className="p-8 text-center text-text-muted">
              Type to start searching...
            </div>
          )}

          {query.trim() && !loading && results && (
            (() => {
              const totalResults = 
                (results.strategies?.length || 0) +
                (results.capabilities?.length || 0) +
                (results.controls?.length || 0) +
                (results.tools?.length || 0);

              if (totalResults === 0) {
                return (
                  <div className="p-8 text-center text-text-muted">
                    No results found for "{query}"
                  </div>
                );
              }

              return (
                <div className="p-4 space-y-6">
                  {/* Strategies */}
                  {results.strategies?.length > 0 && (
                    <ResultSection title="Strategies">
                      {results.strategies.map((strat) => (
                        <ResultItem
                          key={strat._id}
                          id={strat.strategyId}
                          name={strat.strategyName}
                          desc={strat.strategyDescription}
                          onClick={() => handleNavigate('strategy', strat)}
                        />
                      ))}
                    </ResultSection>
                  )}

                  {/* Capabilities */}
                  {results.capabilities?.length > 0 && (
                    <ResultSection title="Capabilities">
                      {results.capabilities.map((cap) => (
                        <ResultItem
                          key={cap._id}
                          id={cap.capabilityId}
                          name={cap.capabilityName}
                          desc={cap.capabilityDescription}
                          onClick={() => handleNavigate('capability', cap)}
                        />
                      ))}
                    </ResultSection>
                  )}

                  {/* Controls */}
                  {results.controls?.length > 0 && (
                    <ResultSection title="Controls">
                      {results.controls.map((ctrl) => (
                        <ResultItem
                          key={ctrl._id}
                          id={ctrl.controlId}
                          name={ctrl.controlName}
                          desc={ctrl.controlDescription}
                          onClick={() => handleNavigate('control', ctrl)}
                        />
                      ))}
                    </ResultSection>
                  )}

                  {/* Tools */}
                  {results.tools?.length > 0 && (
                    <ResultSection title="Tools">
                      {results.tools.map((tool) => (
                        <ResultItem
                          key={tool._id}
                          id={tool.toolId}
                          name={tool.toolName}
                          desc={tool.toolDescription}
                          onClick={() => handleNavigate('tool', tool)}
                        />
                      ))}
                    </ResultSection>
                  )}
                </div>
              );
            })()
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-white/40 text-xs text-text-muted flex justify-between">
          <span>Press <strong>Enter</strong> to select first result</span>
          <span>Press <strong>Esc</strong> to close</span>
        </div>
      </div>
    </div>
  );
};

const ResultSection = ({ title, children }) => (
  <div>
    <h3 className="text-xs  text-text-secondary uppercase tracking-wider mb-2 px-2">
      {title}
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const ResultItem = ({ id, name, desc, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left flex items-start p-3 rounded-lg hover:bg-white/60 hover:shadow-sm group transition-all duration-300 focus:outline-none focus:bg-white/60 border border-transparent hover:border-white/50 cursor-pointer"
  >
    <div className="mt-1 shrink-0">
      <IDTag id={id} />
    </div>
    <div className="ml-4 flex-1 min-w-0">
      <div className="font-medium text-text-primary group-hover:text-primary transition-colors truncate">
        {name}
      </div>
      {desc && (
        <div className="text-sm text-text-muted truncate mt-0.5">
          {desc}
        </div>
      )}
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center ml-4 text-primary">
      <ChevronRight size={16} />
    </div>
  </button>
);
