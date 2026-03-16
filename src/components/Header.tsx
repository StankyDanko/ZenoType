import React from 'react';
import {
  Cpu,
  Trophy,
  BrainCircuit,
  Settings2,
  BarChart2,
  Zap,
  AlignLeft,
  BookOpen,
} from 'lucide-react';
import type { ThemeConfig, AppPhase, Difficulty, BibleProgress } from '../types';
import { BIBLE_BOOKS } from '../constants/bible';
import Settings from './Settings';

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

interface HeaderProps {
  tpm: number;
  accuracy: number;
  highScore: number;
  tScore: number;
  activeTheme: ThemeConfig;
  ollamaEnabled: boolean;
  ollamaError: string;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  showAnalytics: boolean;
  setShowAnalytics: (v: boolean) => void;
  setStatus: (s: string) => void;
  appPhase: AppPhase;
  difficulty: Difficulty;
  activeThread: string;
  bibleProgress: BibleProgress;
  scholarInsight: string;
  isFetchingScholar: boolean;
  onReset: () => void;
  settingsProps: SettingsProps;
}

const Header: React.FC<HeaderProps> = ({
  tpm,
  accuracy,
  highScore,
  tScore,
  activeTheme,
  ollamaEnabled,
  ollamaError,
  showSettings,
  setShowSettings,
  showAnalytics,
  setShowAnalytics,
  setStatus,
  appPhase,
  difficulty,
  activeThread,
  bibleProgress,
  scholarInsight,
  isFetchingScholar,
  onReset,
  settingsProps,
}) => {
  return (
    <header className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-max max-w-[95vw]">
      <div className="flex items-center gap-3 sm:gap-6 bg-[#090e17]/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-800 shadow-2xl text-xs tracking-widest text-slate-500 transition-all duration-300">
        <div
          className={`flex items-center gap-2 font-bold transition-all duration-500 cursor-pointer hover:opacity-80 active:scale-95 ${activeTheme.text}`}
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          title="Return to Main Menu (Alt+R)"
        >
          <Cpu className={`w-4 h-4 ${tpm >= 140 ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">ZenoType</span>
        </div>

        <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span>TPM</span>
          <span className={`text-sm font-bold ${activeTheme.text}`}>
            {tpm}
          </span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-700" />
        <div className="flex items-center gap-2">
          <span>ACC</span>
          <span className="text-sm font-bold">{accuracy}%</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-700" />

        <div
          className="flex items-center gap-2 text-fuchsia-400"
          title="Local High Score"
        >
          <Trophy className="w-3 h-3" />{" "}
          <span className="text-sm font-bold">{highScore}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-700" />
        <div
          className="flex items-center gap-2 text-fuchsia-400"
          title="Transformers Captured"
        >
          <Zap
            className={`w-3 h-3 ${tScore > 0 ? "fill-fuchsia-400" : "fill-fuchsia-400/20"}`}
          />{" "}
          <span className="text-sm font-bold">{tScore}</span>
        </div>

        <div className="w-1 h-1 rounded-full bg-slate-700" />

        {/* MENUS WRAPPER */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(false);
              setShowAnalytics(!showAnalytics);
              if (!showAnalytics) setStatus("paused");
            }}
            className={`p-1.5 rounded-lg transition-all ${showAnalytics ? "bg-cyan-500/20 text-cyan-400 shadow-lg" : "hover:bg-slate-800 hover:text-white"}`}
            title="Session Analytics (Alt+S)"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {ollamaError && (
            <div className="absolute -top-10 right-0 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 whitespace-nowrap">
              {ollamaError}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAnalytics(false);
              setShowSettings(!showSettings);
            }}
            className={`p-1.5 rounded-lg transition-all ${showSettings ? "bg-slate-700 text-white shadow-lg" : "hover:bg-slate-800 hover:text-white"}`}
            title="Settings (Alt+O)"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {showSettings && <Settings {...settingsProps} />}
        </div>
      </div>

      {/* ZenoType 0.5 NEURAL THREAD DISPLAY */}
      {ollamaEnabled && appPhase === "playing" && difficulty !== "scripture" && (
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm px-4 py-1 rounded-full text-[9px] uppercase tracking-widest text-slate-400 flex items-center gap-2 shadow-lg">
          <AlignLeft className="w-3 h-3 text-cyan-500" />
          Neural Thread:{" "}
          <span className="text-slate-200 font-bold">{activeThread}</span>
        </div>
      )}

      {/* SCRIPTURE MODE BANNER */}
      {difficulty === "scripture" && appPhase === "playing" && (
        <div className="w-full max-w-2xl px-4 flex flex-col items-center gap-2 text-center animate-in fade-in duration-700">
          <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 shadow-lg mt-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
            Current Transcription:{" "}
            <span className="text-slate-200 font-bold">
              {BIBLE_BOOKS[bibleProgress.bookIdx]} {bibleProgress.chapter}
            </span>
          </div>

          {ollamaEnabled && (
            <div className="text-xs sm:text-sm text-fuchsia-200/80 font-serif italic max-w-xl leading-relaxed mt-2 border-l-2 border-fuchsia-500/50 pl-4 py-1">
              {isFetchingScholar ? (
                <span className="flex items-center gap-2 opacity-60">
                  <BrainCircuit className="w-3 h-3 animate-spin" /> Scholar is studying this chapter...
                </span>
              ) : scholarInsight ? (
                <>&ldquo;{scholarInsight}&rdquo;</>
              ) : null}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
