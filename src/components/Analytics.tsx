import React from 'react';
import { BarChart2, X } from 'lucide-react';
import type { KeyStat } from '../types';
import { KEYBOARD_ROWS } from '../constants/keyboard';

interface AnalyticsProps {
  tpm: number;
  accuracy: number;
  totalChars: number;
  timeMs: number;
  tScore: number;
  aggregatedKeyStats: Record<string, KeyStat>;
  chartData: number[];
  highScore: number;
  confirmReset: boolean;
  setConfirmReset: (v: boolean) => void;
  onResetStats: () => void;
  onClose: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({
  tpm,
  accuracy,
  totalChars,
  timeMs,
  tScore,
  aggregatedKeyStats,
  chartData,
  highScore,
  confirmReset,
  setConfirmReset,
  onResetStats,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060a11]/90 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0f18] border border-slate-700 rounded-2xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2 tracking-wide">
            <BarChart2 className="w-6 h-6 text-cyan-400" /> Session
            Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Overview Panel */}
          <div className="border border-slate-800 rounded-xl p-5 bg-[#060a11]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Current Session
            </h3>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Adjusted TPM:</span>{" "}
                <span className="font-bold text-cyan-400 text-base">
                  {tpm}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>{" "}
                <span className="font-bold text-slate-100">
                  {accuracy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Raw Keystrokes:</span>{" "}
                <span className="font-bold text-slate-100">
                  {totalChars}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time Active:</span>{" "}
                <span className="font-bold text-slate-100">
                  {(timeMs / 1000).toFixed(1)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Transformers Captured:</span>{" "}
                <span className="font-bold text-fuchsia-400">{tScore}</span>
              </div>
            </div>
          </div>

          {/* Worst Keys Panel */}
          <div className="border border-slate-800 rounded-xl p-5 bg-[#060a11]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Worst Keys (All-Time)
            </h3>
            <div className="flex flex-col gap-3 text-sm font-mono">
              {Object.entries(aggregatedKeyStats)
                .map(([k, v]) => ({
                  key: k,
                  acc: v.hits / (v.hits + v.misses),
                  total: v.hits + v.misses,
                }))
                .filter((k) => k.total >= 3 && k.acc < 1)
                .sort((a, b) => a.acc - b.acc)
                .slice(0, 4)
                .map((k, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-slate-800/30 px-3 py-1.5 rounded"
                  >
                    <span className="text-slate-400">
                      Key{" "}
                      <span className="text-rose-400 font-bold text-base px-1">
                        '{k.key}'
                      </span>
                    </span>
                    <span className="font-bold text-slate-200">
                      {(k.acc * 100).toFixed(1)}%{" "}
                      <span className="text-xs text-slate-500 font-normal">
                        acc
                      </span>
                    </span>
                  </div>
                ))}
              {Object.keys(aggregatedKeyStats).length === 0 && (
                <span className="text-slate-600 italic">
                  Not enough data to calculate weaknesses yet.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TPM Graph */}
        <div className="border border-slate-800 rounded-xl p-5 bg-[#060a11] h-48 flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            TPM History{" "}
            <span className="normal-case tracking-normal opacity-60">
              (Entire Session)
            </span>
          </h3>
          <div className="flex-1 relative w-full flex items-end justify-between gap-[2px] mt-2">
            {chartData.length > 0 ? (
              chartData.map((val, i) => {
                const max = Math.max(20, ...chartData);
                const h = (val / max) * 100;
                return (
                  <div
                    key={i}
                    className="w-full bg-cyan-500/10 rounded-t-sm relative group transition-all duration-300 hover:bg-cyan-500/40"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded text-white z-10 font-bold shadow-lg transition-opacity duration-200 pointer-events-none">
                      {val}
                    </div>
                    <div
                      className="w-full bg-cyan-400 rounded-t-sm absolute bottom-0"
                      style={{ height: "2px" }}
                    />
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm italic">
                Start typing to generate history!
              </div>
            )}
          </div>
        </div>

        {/* Heatmap */}
        <div className="border border-slate-800 rounded-xl p-5 bg-[#060a11]">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Keyboard Heatmap
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirmReset) {
                  onResetStats();
                  setConfirmReset(false);
                } else {
                  setConfirmReset(true);
                  setTimeout(() => setConfirmReset(false), 3000);
                }
              }}
              className={`text-[9px] px-2 py-1 rounded transition-colors font-bold uppercase tracking-wider ${confirmReset ? "bg-red-500 text-white" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
            >
              {confirmReset ? "Confirm Reset" : "Reset History"}
            </button>
          </div>
          <div className="flex flex-col gap-2 items-center">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1.5 sm:gap-2">
                {row.map((key) => {
                  const stat = aggregatedKeyStats[key.toLowerCase()];
                  let hits = stat ? stat.hits : 0;
                  let misses = stat ? stat.misses : 0;

                  const total = hits + misses;
                  let colorClass =
                    "bg-slate-800/50 text-slate-600 border-slate-700/50";

                  if (total > 0) {
                    const acc = hits / total;
                    if (acc >= 0.9)
                      colorClass =
                        "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.1)]";
                    else if (acc >= 0.6)
                      colorClass =
                        "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.1)]";
                    else
                      colorClass =
                        "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]";
                  }

                  return (
                    <div
                      key={key}
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded border flex items-center justify-center font-bold uppercase text-xs sm:text-sm transition-colors ${colorClass}`}
                    >
                      {key === " " ? "SPC" : key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6 text-[10px] text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500/50"></div>{" "}
              &gt; 90%
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-500/50"></div> 60
              - 90%
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-rose-500/50"></div>{" "}
              &lt; 60%
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700"></div>{" "}
              None
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
