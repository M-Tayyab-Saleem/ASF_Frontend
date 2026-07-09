import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, FileText, ChevronRight, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getImplementationProgress,
  getImplementationTrend,
  getTopRiskAreas,
  getRecentEvidenceDashboard,
  getControlsSummary
} from '../api';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ImplementationTrendChart } from '../components/dashboard/ImplementationTrendChart';
import { ImplementationProgressBar } from '../components/dashboard/ImplementationProgressBar';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg text-sm">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── WIDGETS ─────────────────────────────────────────────────────────────────

const FrameworkScoreWidget = ({ summary }) => {
  const { total = 0, implemented = 0, pending = 0, atRisk = 0 } = summary || {};
  const score = total > 0 ? Math.round((implemented / total) * 100) : 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity size={18} className="text-[#00B097]" /> Framework Score
        </h3>
      </div>
      
      <div className="flex flex-col xl:flex-row xl:items-center gap-6">
        <div className="flex flex-col justify-center items-center xl:items-start min-w-[80px]">
          <span className="text-5xl lg:text-6xl font-bold text-[#00B097] leading-none">{score}%</span>
        </div>
        
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
          <div className="flex flex-col xl:border-l border-slate-100 xl:pl-6">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1 whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00B097]" /> Implemented
            </div>
            <span className="text-2xl font-semibold text-slate-800">{implemented}</span>
          </div>
          <div className="flex flex-col xl:border-l border-slate-100 xl:pl-6">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1 whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Pending
            </div>
            <span className="text-2xl font-semibold text-slate-800">{pending}</span>
          </div>
          <div className="flex flex-col xl:border-l border-slate-100 xl:pl-6">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1 whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> At Risk
            </div>
            <span className="text-2xl font-semibold text-slate-800">{atRisk}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlsByStatusWidget = ({ summary }) => {
  const data = [
    { name: 'Implemented', value: summary?.implemented || 0, color: '#00B097' },
    { name: 'Pending', value: summary?.pending || 0, color: '#F59E0B' },
    { name: 'At Risk', value: summary?.atRisk || 0, color: '#F43F5E' }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-64 flex flex-col hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
        <PieChartIcon size={18} className="text-[#00B097]" /> Controls by Status
      </h3>
      <div className="flex-1 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="30%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute left-[30%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-2xl font-bold text-slate-800">{summary?.total || 0}</div>
          <div className="text-[10px] text-slate-500 uppercase">Total</div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
           {data.map(d => (
             <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: d.color}} />
                <span className="text-slate-600 font-medium">{d.name}</span>
                <span className="font-bold text-slate-800 ml-auto pl-2">{d.value}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const TopRiskAreasWidget = ({ topRiskAreas }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-64 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <ShieldAlert size={18} className="text-rose-500" /> Top Gap Areas
        </h3>
        <Link to="/" className="text-xs font-medium text-[#00B097] hover:underline">View all</Link>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {topRiskAreas && topRiskAreas.length > 0 ? topRiskAreas.map((risk, i) => (
          <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 text-slate-700 truncate pr-4">
              <span className="truncate font-medium">{risk.area}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                 risk.level === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
               }`}>{risk.level}</span>
               <span className="font-semibold text-slate-800 w-4 text-right">{risk.count}</span>
            </div>
          </div>
        )) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">No significant gaps identified.</div>
        )}
      </div>
    </div>
  );
};

const RecentEvidenceWidget = ({ recentEvidence }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-[#009681]" /> Recent Evidence
        </h3>
        <Link to="/evidence" className="text-xs font-medium text-[#00B097] hover:underline">View all</Link>
      </div>
      <div className="space-y-4">
        {recentEvidence && recentEvidence.length > 0 ? recentEvidence.map(ev => (
          <div key={ev.evidenceId} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
            <div className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-lg text-[#009681] shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 truncate">{ev.fileName}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5 truncate">{ev.controlName}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1.5 font-semibold">
                {ev.category}
              </div>
            </div>
            <div className="text-xs text-slate-400 font-medium whitespace-nowrap bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
              {new Date(ev.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        )) : (
          <div className="text-center text-slate-400 text-sm py-4">No recent evidence uploaded.</div>
        )}
      </div>
    </div>
  );
};

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [trendData, setTrendData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [evidenceData, setEvidenceData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [trendRes, progressRes, riskRes, evidenceRes, summaryRes] = await Promise.all([
        getImplementationTrend(),
        getImplementationProgress(),
        getTopRiskAreas(),
        getRecentEvidenceDashboard(),
        getControlsSummary()
      ]);

      if (trendRes?.data?.success) setTrendData(trendRes.data.data);
      if (progressRes?.data?.success) setProgressData(progressRes.data.data);
      if (riskRes?.data?.success) setRiskData(riskRes.data.data);
      if (evidenceRes?.data?.success) setEvidenceData(evidenceRes.data.data);
      if (summaryRes?.data?.success) setSummaryData(summaryRes.data.data);

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <div className="flex justify-center items-center h-full min-h-[400px]"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-center py-12 text-rose-500 font-medium bg-rose-50 rounded-xl">{error}</div>;
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Real-time overview of security posture and control implementation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* LEFT COLUMN: PRIMARY METRICS */}
        <div className="xl:col-span-8 space-y-6">
          <FrameworkScoreWidget summary={summaryData} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImplementationTrendChart data={trendData} />
            <ControlsByStatusWidget summary={summaryData} />
          </div>
          
          <ImplementationProgressBar data={progressData} />
        </div>

        {/* RIGHT COLUMN: RISKS & EVIDENCE */}
        <div className="xl:col-span-4 space-y-6">
          <TopRiskAreasWidget topRiskAreas={riskData} />
          <RecentEvidenceWidget recentEvidence={evidenceData} />
          
          {/* Quick Actions (Optional, fits well with Data-Dense style) */}
          <div className="bg-gradient-to-br from-[#00B097] to-[#009681] rounded-2xl p-6 shadow-md text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">Quick Actions</h3>
            <p className="text-sm opacity-80 mb-4">Jump straight into managing your framework.</p>
            <div className="space-y-2">
              <Link to="/" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium">
                View Strategies <ChevronRight size={16} />
              </Link>
              <Link to="/controls" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium">
                Manage Controls <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
