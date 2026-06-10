import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const initialState = {
  selectedStrategy: null,      // { strategyId, strategyName }
  selectedTab: 'capabilities', // 'capabilities' | 'controls'
  selectedItem: null,          // { type: 'capability'|'control', id: '...' }
  searchQuery: '',
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
