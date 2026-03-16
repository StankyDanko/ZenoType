import React from 'react';
import { RefreshCw, Volume2, VolumeX, Hand, BrainCircuit } from 'lucide-react';
import type { Difficulty } from '../types';

interface SettingsProps {
  selectedModel: string;
  availableModels: string[];
  difficulty: Difficulty;
  visibleLines: number;
  showHands: boolean;
  ollamaEnabled: boolean;
  soundEnabled: boolean;
  onModelChange: (model: string) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onVisibleLinesChange: (lines: number) => void;
  onToggleHands: () => void;
  onToggleOllama: () => void;
  onToggleSound: () => void;
  onRestart: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const Settings: React.FC<SettingsProps> = ({
  selectedModel,
  availableModels,
  difficulty,
  visibleLines,
  showHands,
  ollamaEnabled,
  soundEnabled,
  onModelChange,
  onDifficultyChange,
  onVisibleLinesChange,
  onToggleHands,
  onToggleOllama,
  onToggleSound,
  onRestart,
  inputRef,
}) => {
  return (
    <div
      className="absolute top-14 right-0 w-72 p-5 bg-[#0a0f18] border border-slate-700 rounded-xl shadow-2xl flex flex-col gap-4 z-50 text-slate-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-slate-500">
          Ollama Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-sm outline-none focus:border-cyan-500"
        >
          {availableModels.length > 0 ? (
            availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))
          ) : (
            <option>No Models Found</option>
          )}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-slate-500">
          Difficulty Flow
        </label>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-sm outline-none focus:border-cyan-500"
        >
          <option value="adaptive">Adaptive (Auto-Scales)</option>
          <option value="standard">Standard Words</option>
          <option value="code">Functions & Variables</option>
          <option value="syntax">Syntax & Symbols</option>
          <option value="scripture">Scripture (Bible)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-slate-500 flex justify-between">
          <span>Text Visibility</span>
          <span className="text-slate-600 font-normal">Alt+&#x2191;/&#x2193;</span>
        </label>
        <select
          value={visibleLines}
          onChange={(e) => {
            onVisibleLinesChange(Number(e.target.value));
            inputRef.current?.focus();
          }}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-sm outline-none focus:border-cyan-500"
        >
          <option value={2}>2 Lines (Zen Focus)</option>
          <option value={3}>3 Lines (Standard)</option>
          <option value={4}>4 Lines (Expanded)</option>
          <option value={5}>5 Lines (Full Buffer)</option>
          <option value={10}>10 Lines (Terminal)</option>
        </select>
      </div>

      <hr className="border-slate-800 my-1" />

      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
          <Hand className="w-4 h-4" /> Guide Hands{" "}
          <span className="text-slate-600 font-normal lowercase">
            (Alt+H)
          </span>
        </span>
        <button
          onClick={onToggleHands}
          className={`px-2 py-1 text-xs font-bold rounded transition-all ${showHands ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}
        >
          {showHands ? "ON" : "OFF"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" /> AI Engine
        </span>
        <button
          onClick={onToggleOllama}
          className={`px-2 py-1 text-xs font-bold rounded transition-all ${ollamaEnabled ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-slate-800 text-slate-400"}`}
        >
          {ollamaEnabled ? "ENABLED" : "OFF"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}{" "}
          Audio
        </span>
        <button
          onClick={onToggleSound}
          className={`px-2 py-1 text-xs font-bold rounded transition-all ${soundEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
        >
          {soundEnabled ? "ON" : "MUTED"}
        </button>
      </div>

      <hr className="border-slate-800 my-1" />

      <button
        onClick={onRestart}
        className="w-full py-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded text-xs font-bold uppercase flex justify-center items-center gap-2"
        title="Alt+R"
      >
        <RefreshCw className="w-4 h-4" /> Restart Session
      </button>
    </div>
  );
};

export default Settings;
