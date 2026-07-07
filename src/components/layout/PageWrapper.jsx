import { useState } from 'react';
import { Sidebar } from './Sidebar';

export const PageWrapper = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <main className="flex-1 h-screen overflow-y-auto relative z-10 p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
