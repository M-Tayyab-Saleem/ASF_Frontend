import { useState } from 'react';
import { Check, Clock, ChevronRight, CornerUpLeft, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { updateLifecycle, toggleAtRisk } from '../../api';

const STAGES = ['Defined', 'Implemented', 'Evidence Added', 'Validated', 'Review'];

const STAGE_COLORS = {
  Defined:         { dot: 'bg-[#94A3B8]',  label: 'text-[#94A3B8]',  ring: 'ring-[#94A3B8]/30'  },
  Implemented:     { dot: 'bg-[#00B097]',  label: 'text-[#00B097]',  ring: 'ring-[#00B097]/30'  },
  'Evidence Added':{ dot: 'bg-[#6366F1]',  label: 'text-[#6366F1]',  ring: 'ring-[#6366F1]/30'  },
  Validated:       { dot: 'bg-[#22C55E]',  label: 'text-[#22C55E]',  ring: 'ring-[#22C55E]/30'  },
  Review:          { dot: 'bg-[#F59E0B]',  label: 'text-[#F59E0B]',  ring: 'ring-[#F59E0B]/30'  },
};

// ─────────────────────────────────────────────────────────────────────────────
export const LifecycleTimeline = ({ control, isAdmin, onUpdated }) => {
  const currentStage    = control?.lifecycleStage || 'Defined';
  const currentIdx      = STAGES.indexOf(currentStage);
  const atRisk          = control?.atRisk || false;
  const controlId       = control?.controlId;

  const [advancing, setAdvancing]       = useState(false);
  const [reverting, setReverting]       = useState(false);
  const [togglingRisk, setTogglingRisk] = useState(false);
  const [showRevertBox, setShowRevertBox] = useState(false);
  const [revertReason, setRevertReason]   = useState('');
  const [revertError, setRevertError]     = useState('');
  const [actionError, setActionError]     = useState('');

  // ── Advance ───────────────────────────────────────────────────────────────
  const handleAdvance = async () => {
    setActionError('');
    setAdvancing(true);
    try {
      const res = await updateLifecycle(controlId, 'advance', null);
      onUpdated(res.data.data);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to advance stage');
    } finally {
      setAdvancing(false);
    }
  };

  // ── Revert ────────────────────────────────────────────────────────────────
  const handleRevert = async () => {
    if (!revertReason.trim()) {
      setRevertError('Reason is required to revert a stage');
      return;
    }
    setRevertError('');
    setReverting(true);
    try {
      const res = await updateLifecycle(controlId, 'revert', revertReason);
      setShowRevertBox(false);
      setRevertReason('');
      onUpdated(res.data.data);
    } catch (err) {
      setRevertError(err.response?.data?.error || 'Failed to revert stage');
    } finally {
      setReverting(false);
    }
  };

  // ── At Risk toggle ────────────────────────────────────────────────────────
  const handleToggleAtRisk = async () => {
    setTogglingRisk(true);
    try {
      const res = await toggleAtRisk(controlId, !atRisk);
      onUpdated(res.data.data);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update at-risk flag');
    } finally {
      setTogglingRisk(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Lifecycle Stage</h4>
        {atRisk && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
            <AlertTriangle size={11} /> At Risk
          </span>
        )}
      </div>

      {/* ── 5-node timeline ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-1 px-2 pt-1 -mx-2">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent   = idx === currentIdx;
          const isFuture    = idx > currentIdx;
          const colors      = STAGE_COLORS[stage];

          return (
            <div key={stage} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isCompleted ? `${colors.dot} text-white`                            : ''}
                  ${isCurrent   ? `${colors.dot} text-white ring-4 ${colors.ring} scale-110` : ''}
                  ${isFuture    ? 'bg-[#F1F5F9] text-[#CBD5E1]'                         : ''}
                `}>
                  {isCompleted && <Check size={14} strokeWidth={3} />}
                  {isCurrent   && <Check size={14} strokeWidth={3} />}
                  {isFuture    && <Clock size={13} />}
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight max-w-[60px] whitespace-normal
                  ${isCurrent ? `${colors.label} font-semibold` : isFuture ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                  {stage}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {idx < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all
                  ${idx < currentIdx ? 'bg-[#00B097]' : 'bg-[#E2E8F0]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Admin controls ───────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {/* Advance button */}
            {currentIdx < STAGES.length - 1 && (
              <button
                onClick={handleAdvance}
                disabled={advancing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl
                           bg-[#00B097] text-white hover:bg-[#009B85] disabled:opacity-60 transition-colors"
              >
                {advancing
                  ? <Loader2 size={12} className="animate-spin" />
                  : <ChevronRight size={14} />
                }
                Advance to {STAGES[currentIdx + 1]}
              </button>
            )}

            {/* Revert button */}
            {currentIdx > 0 && !showRevertBox && (
              <button
                onClick={() => setShowRevertBox(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl
                           border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                <CornerUpLeft size={13} /> Revert Stage
              </button>
            )}

            {/* At Risk toggle */}
            <button
              onClick={handleToggleAtRisk}
              disabled={togglingRisk}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors
                ${atRisk
                  ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                  : 'border border-[#E2E8F0] text-[#64748B] hover:bg-[#FFF7ED] hover:border-orange-200 hover:text-orange-600'
                } disabled:opacity-60`}
            >
              {togglingRisk
                ? <Loader2 size={12} className="animate-spin" />
                : <AlertTriangle size={13} />
              }
              {atRisk ? 'Clear At Risk' : 'Mark At Risk'}
            </button>
          </div>

          {/* Revert reason box */}
          {showRevertBox && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <CornerUpLeft size={13} /> Revert to "{STAGES[currentIdx - 1]}" — reason required
              </p>
              <textarea
                value={revertReason}
                onChange={(e) => { setRevertReason(e.target.value); setRevertError(''); }}
                placeholder="Explain why this stage is being reverted…"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl outline-none
                           focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none bg-white"
              />
              {revertError && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle size={11} /> {revertError}
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setShowRevertBox(false); setRevertReason(''); setRevertError(''); }}
                  className="flex-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleRevert} disabled={reverting}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600
                             text-white disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5">
                  {reverting ? <Loader2 size={12} className="animate-spin" /> : <CornerUpLeft size={12} />}
                  Confirm Revert
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle size={11} /> {actionError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
