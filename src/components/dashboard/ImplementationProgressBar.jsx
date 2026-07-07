export const ImplementationProgressBar = ({ data }) => {
  if (!data || !data.length) return null;
  
  // Sort descending by implementation %
  const sortedData = [...data].sort((a, b) => {
    const pctA = a.total > 0 ? (a.implemented / a.total) : 0;
    const pctB = b.total > 0 ? (b.implemented / b.total) : 0;
    return pctB - pctA;
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Implementation Progress</h3>
      <div className="space-y-4">
        {sortedData.map(cat => {
          const pct = Math.round((cat.implemented / cat.total) * 100) || 0;
          const pendingPct = Math.round((cat.pending / cat.total) * 100) || 0;
          const notImplPct = Math.round((cat.atRisk / cat.total) * 100) || 0;
          
          return (
            <div key={cat.category} className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between items-center text-xs">
                 <span className="font-medium text-[#0D1514]">{cat.category}</span>
                 <span className="text-slate-500 font-medium">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${pct}%` }} className="bg-[#00B097] h-full transition-all duration-500" />
                <div style={{ width: `${pendingPct}%` }} className="bg-[#F59E0B] h-full transition-all duration-500" />
                <div style={{ width: `${notImplPct}%` }} className="bg-rose-500 h-full transition-all duration-500" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-6 text-[10px] text-slate-500 justify-center uppercase tracking-wider font-semibold">
         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#00B097]"/> Implemented</span>
         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#F59E0B]"/> Pending</span>
         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-rose-500"/> At Risk</span>
      </div>
    </div>
  );
};
