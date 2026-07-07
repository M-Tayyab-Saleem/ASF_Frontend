import { useState, useEffect, useCallback } from 'react';
import { getControlsSummary, getControlsByCategory } from '../../api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const COLORS = ['#00B097', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#F97316', '#6366F1'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg text-sm">
        <p className="font-semibold text-slate-800 mb-1">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.color || payload[0].fill }}>
          Controls: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, colorClass, borderClass }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border ${borderClass} border-t-4 hover:shadow-md transition-shadow`}>
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</h3>
    <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
  </div>
);

export const ControlsOverview = ({ strategyId }) => {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Pass strategyId only if it exists
      const params = strategyId ? { strategyId } : {};
      const [summaryRes, categoryRes] = await Promise.all([
        getControlsSummary(params),
        getControlsByCategory(params)
      ]);
      if (summaryRes.data?.success) setSummary(summaryRes.data.data);
      if (categoryRes.data?.success) setCategories(categoryRes.data.data);
    } catch (error) {
      console.error('Failed to fetch controls overview:', error);
    } finally {
      setLoading(false);
    }
  }, [strategyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  const donutData = categories.map((cat, index) => ({
    name: cat.category,
    value: cat.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="p-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-[#0D1514] mb-6">Controls Overview</h2>
      
      {/* 4-card Summary Stat Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Controls" value={summary?.total || 0} colorClass="text-slate-800" borderClass="border-slate-200 border-t-slate-400" />
        <StatCard label="Implemented" value={summary?.implemented || 0} colorClass="text-[#00B097]" borderClass="border-slate-200 border-t-[#00B097]" />
        <StatCard label="Pending" value={summary?.pending || 0} colorClass="text-[#F59E0B]" borderClass="border-slate-200 border-t-[#F59E0B]" />
        <StatCard label="At Risk" value={summary?.atRisk || 0} colorClass="text-rose-500" borderClass="border-slate-200 border-t-rose-500" />
      </div>

      {/* Controls by Category Donut */}
      {donutData.length > 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-6">Controls by Category</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-64 h-64 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                    {donutData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-bold text-slate-800">{summary?.total || 0}</div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Controls</div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: d.color}} />
                  <span className="text-slate-600 font-medium truncate" title={d.name}>{d.name}</span>
                  <span className="font-bold text-slate-800 ml-auto pl-2">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200 text-slate-500">
          No controls found for this strategy.
        </div>
      )}
    </div>
  );
};
