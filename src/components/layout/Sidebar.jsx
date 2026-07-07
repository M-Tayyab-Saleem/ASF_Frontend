import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Shield, FileText, CheckSquare, Search,
  Wrench, Link as LinkIcon, Users, Activity, FileBarChart,
  Settings, LogOut, Menu, ChevronLeft
} from 'lucide-react';
import { Logo } from '../shared/Logo';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { SearchModal } from './SearchModal';

const SidebarLink = ({ to, icon: Icon, label, badge, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center px-4 py-3 rounded-lg text-sm transition-colors relative group
      ${collapsed ? 'justify-center' : 'justify-between'}
      ${isActive ? 'bg-[#00B097] text-white font-medium shadow-sm' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'}
    `}
  >
    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} w-full`}>
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </div>
    
    {/* Tooltip for collapsed mode */}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-[#1E293B] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    )}

    {!collapsed && badge && (
      <span className="bg-[#1E293B] text-xs font-semibold px-2 py-0.5 rounded-full text-white">
        {badge}
      </span>
    )}
  </NavLink>
);

const SectionHeading = ({ children, collapsed }) => (
  <div className={`text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-3 mt-8 ${collapsed ? 'text-center px-0' : 'px-4'}`}>
    {collapsed ? '...' : children}
  </div>
);

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[#0D1514] text-white flex flex-col h-screen shrink-0 overflow-visible transition-all duration-300 relative z-20 shadow-xl border-r border-[#00B097]/20`}>
        <div className={`p-6 shrink-0 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo className="w-7 h-7 text-[#00B097] shrink-0" />
            {!collapsed && <span className="font-semibold text-lg tracking-tight whitespace-nowrap">AI Security</span>}
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-8 right-[-14px] bg-[#00B097] text-white p-1.5 rounded-full z-50 shadow-md hover:bg-[#009681] transition-colors border-2 border-[#0D1514]"
        >
          {collapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className="flex-1 px-3 space-y-1.5 pb-8 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          
          <SectionHeading collapsed={collapsed}>Framework</SectionHeading>
          <SidebarLink to="/" icon={CheckSquare} label="Framework Explorer" collapsed={collapsed} />
          <SidebarLink to="/controls" icon={Shield} label="All Controls" collapsed={collapsed} />
          <SidebarLink to="/evidence" icon={FileText} label="Evidence Feed" collapsed={collapsed} />

          <SectionHeading collapsed={collapsed}>Tools & Tech</SectionHeading>
          <SidebarLink to="/tools" icon={Wrench} label="Tools" badge="NEW" collapsed={collapsed} />
          <SidebarLink to="/tool-mapping" icon={LinkIcon} label="Tool Mapping" collapsed={collapsed} />
          <SidebarLink to="/tool-owners" icon={Users} label="Tool Owners" collapsed={collapsed} />

          {user?.role === 'admin' && (
            <>
              <SectionHeading collapsed={collapsed}>Governance</SectionHeading>
              <SidebarLink to="/users" icon={Users} label="User Management" collapsed={collapsed} />
            </>
          )}
        </nav>

        <div className={`p-4 border-t border-white/10 shrink-0 ${collapsed ? 'items-center flex flex-col' : ''}`}>
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 text-left'} px-4 py-2.5 w-full rounded-lg text-sm text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors relative group`}
          >
            <Search size={18} className="shrink-0" />
            {!collapsed && <span>Search</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#0D1514] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Search
              </div>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 text-left'} px-4 py-2.5 w-full rounded-lg text-sm text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors mt-1 relative group`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#0D1514] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
