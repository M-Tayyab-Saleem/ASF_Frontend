import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyDashboard, getUserDashboard, getAllDashboard, getDashboardUsers, updateUserRole } from '../api';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Dropdown } from '../components/shared/Dropdown';

const STATUS_COLORS = {
  Implemented: '#00B097', // Teal
  'Not Implemented': '#EF4444',
  Pending: '#F59E0B'
};

const StatCard = ({ label, count, percentage, color }) => (
  <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
    <p className="text-sm text-text-muted uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-light text-text-primary mt-1">
      {count}
      {percentage !== undefined && (
        <span className="text-lg text-text-secondary ml-1">({percentage}%)</span>
      )}
    </p>
    {color && (
      <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: color, width: `${Math.min(percentage || 0, 100)}%` }} />
    )}
  </div>
);

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-white/50 p-3 rounded-lg shadow-glass">
        <p className="font-semibold text-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarChart = ({ data, labelKey, title }) => {
  if (!data || data.length === 0) return null;

  // Calculate dynamic height based on number of items to prevent squishing
  const MIN_HEIGHT = Math.max(data.length * 40, 200);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl p-6 h-96 flex flex-col shadow-glass hover:shadow-glass-hover transition-all duration-300">
      <h3 className="text-lg  text-text-primary mb-4">{title}</h3>
      <div className="flex-1 w-full min-h-0 overflow-y-auto pr-2">
        <div style={{ height: MIN_HEIGHT, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              barSize={24}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey={labelKey} 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={200}
                tick={{ fill: '#6B7280', fontSize: 12 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="implemented" name="Implemented" stackId="a" fill={STATUS_COLORS.Implemented} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.Pending} />
              <Bar dataKey="notImplemented" name="Not Implemented" stackId="a" fill={STATUS_COLORS['Not Implemented']} radius={[0, 4, 4, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ControlChart = ({ byControl }) => {
  if (!byControl || byControl.length === 0) return null;

  const impl = byControl.filter(c => c.status === 'Implemented').length;
  const notImpl = byControl.filter(c => c.status === 'Not Implemented').length;
  const pending = byControl.filter(c => c.status === 'Pending' || !c.status).length;
  const total = byControl.length;

  const data = [
    { name: 'Implemented', value: impl, color: STATUS_COLORS.Implemented },
    { name: 'Not Implemented', value: notImpl, color: STATUS_COLORS['Not Implemented'] },
    { name: 'Pending', value: pending, color: STATUS_COLORS.Pending }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl p-6 h-80 flex flex-col shadow-glass hover:shadow-glass-hover transition-all duration-300">
      <h3 className="text-lg  text-text-primary mb-4">Control Status Overview</h3>
      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AdminUsersManager = ({ users: initialUsers }) => {
  const [users, setUsers] = useState(initialUsers);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  };

  if (!users || users.length === 0) return null;

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
      <h3 className="text-lg  text-text-primary mb-4">User Management</h3>
      <div className="overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
              <th className="text-left py-2 pr-4">Name</th>
              <th className="text-left py-2 pr-4">Email</th>
              <th className="text-left py-2 pr-4">Role</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-white/40 hover:bg-white/40 transition-colors">
                <td className="py-2 pr-4 text-text-primary">{u.fullName}</td>
                <td className="py-2 pr-4 text-text-secondary">{u.email}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${u.role === 'admin' ? 'text-primary border-primary/30 bg-primary-light' : 'text-text-secondary border-border'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <Dropdown
                    value={u.role}
                    onChange={(val) => handleRoleChange(u._id, val)}
                    disabled={saving === u._id}
                    options={[
                      { label: 'user', value: 'user' },
                      { label: 'admin', value: 'admin' }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('me');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const isAdmin = user?.role === 'admin';

  const fetchDashboard = useCallback(async () => {
    try {
      let res;
      if (viewMode === 'me') {
        res = await getMyDashboard();
      } else if (viewMode === 'all') {
        res = await getAllDashboard();
      } else if (viewMode === 'user' && selectedUserId) {
        res = await getUserDashboard(selectedUserId);
      }
      if (res?.data?.success) {
        setDashboardData(res.data.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [viewMode, selectedUserId]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  useEffect(() => {
    if (isAdmin) {
      getDashboardUsers().then(res => {
        if (res.data.success) setUsers(res.data.data);
      }).catch(() => {});
    }
  }, [isAdmin]);

  const handleViewChange = (mode, userId = null) => {
    setLoading(true);
    setViewMode(mode);
    setSelectedUserId(userId);
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-status-notImplemented">{error}</p>
      </div>
    );
  }

  const { stats, byStrategy, byCapability, byControl } = dashboardData || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl  text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            {viewMode === 'me' && `Welcome, ${user?.fullName}`}
            {viewMode === 'all' && 'All Users — Combined View'}
            {viewMode === 'user' && users.find(u => u._id === selectedUserId)?.fullName}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">View:</label>
            <Dropdown
              value={viewMode === 'me' ? 'me' : viewMode === 'all' ? 'all' : selectedUserId || 'me'}
              onChange={(val) => {
                if (val === 'me') handleViewChange('me');
                else if (val === 'all') handleViewChange('all');
                else handleViewChange('user', val);
              }}
              options={[
                { label: 'My Dashboard', value: 'me' },
                { label: 'All Users', value: 'all' },
                ...users.map(u => ({ label: u.fullName, value: u._id }))
              ]}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Controls" count={stats?.totalControls || 0} />
        <StatCard
          label="Implemented"
          count={stats?.implemented?.count || 0}
          percentage={stats?.implemented?.percentage || 0}
          color={STATUS_COLORS.Implemented}
        />
        <StatCard
          label="Pending"
          count={stats?.pending?.count || 0}
          percentage={stats?.pending?.percentage || 0}
          color={STATUS_COLORS.Pending}
        />
        <StatCard
          label="Not Implemented"
          count={stats?.notImplemented?.count || 0}
          percentage={stats?.notImplemented?.percentage || 0}
          color={STATUS_COLORS['Not Implemented']}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={byStrategy || []}
          labelKey="strategyName"
          title="By Strategy"
        />
        <BarChart
          data={byCapability || []}
          labelKey="capabilityName"
          title="By Capability"
        />
      </div>

      <ControlChart byControl={byControl || []} />

      {isAdmin && users.length > 0 && (
        <AdminUsersManager users={users} />
      )}
    </div>
  );
};
