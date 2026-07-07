import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg text-sm">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        <p style={{ color: '#00B097' }}>
          Implemented: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export const ImplementationTrendChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-sm text-slate-500 text-center py-8">No data available</div>;

  const current = data[data.length - 1]?.implementedPct || 0;
  const previous = data[data.length - 2]?.implementedPct || 0;
  const delta = current - previous;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-64 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Implementation Trend</h3>
        {delta !== 0 && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
            delta > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
          }`}>
            {delta > 0 ? '+' : ''}{delta}% vs last month
          </span>
        )}
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="implementedPct" stroke="#00B097" strokeWidth={3} dot={{ r: 4, fill: '#00B097', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
