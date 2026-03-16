import React from 'react';
import { Search, ChevronRight, ScrollText } from 'lucide-react';
import type { BibleProgress } from '../types';
import { BIBLE_BOOKS, CURATED_PASSAGES } from '../constants/bible';

interface ScriptureSelectProps {
  bibleProgress: BibleProgress;
  customBibleSearch: string;
  setCustomBibleSearch: (v: string) => void;
  bibleApiError: string;
  showVerseNumbers: boolean;
  setShowVerseNumbers: (v: boolean) => void;
  bibleVersion: string;
  setBibleVersion: (v: string) => void;
  onLoadChapter: (bookIdx: number, chapter: number) => void;
  onSearch: () => void;
}

const ScriptureSelect: React.FC<ScriptureSelectProps> = ({
  bibleProgress,
  customBibleSearch,
  setCustomBibleSearch,
  bibleApiError,
  showVerseNumbers,
  setShowVerseNumbers,
  bibleVersion,
  setBibleVersion,
  onLoadChapter,
  onSearch,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-[#060a11]/95 backdrop-blur-md px-8 pt-20">
      <div className="max-w-3xl w-full flex flex-col gap-8 animate-in fade-in zoom-in duration-500 ease-out">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 tracking-tight">
            Scripture Mode
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl font-medium">
            Where would you like to begin your transcription?
          </p>
        </div>

        {/* Bible Search Input */}
        <div className="relative flex flex-col gap-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              value={customBibleSearch}
              onChange={(e) => setCustomBibleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              placeholder="e.g. Genesis 1, John 3, Romans 8"
              className="w-full bg-[#0a0f18] border-2 border-slate-700/50 text-slate-200 font-bold text-xl p-5 pl-14 rounded-2xl outline-none focus:border-cyan-500 focus:bg-[#0d1421] transition-all shadow-inner placeholder:font-normal placeholder:text-slate-600"
              autoFocus
            />
            <button
              onClick={onSearch}
              className="absolute inset-y-2 right-2 bg-cyan-500 hover:bg-cyan-400 text-[#060a11] px-6 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              disabled={customBibleSearch.trim().length === 0}
            >
              Transcribe <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {bibleApiError && (
            <div className="text-red-400 text-sm font-bold pl-2">
              {bibleApiError}
            </div>
          )}
        </div>

        {/* Continue from Save */}
        <div className="flex justify-center my-2">
          <button
            onClick={() => onLoadChapter(bibleProgress.bookIdx, bibleProgress.chapter)}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-200 font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            <ScrollText className="w-5 h-5 text-cyan-400" /> Continue from
            save: {BIBLE_BOOKS[bibleProgress.bookIdx]} {bibleProgress.chapter}
          </button>
        </div>

        {/* Curated Passages */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
            Curated Passages:
          </span>
          <div className="flex flex-wrap gap-3">
            {CURATED_PASSAGES.map((p) => {
              const bIdx = BIBLE_BOOKS.indexOf(p.book);
              return (
                <button
                  key={p.label}
                  onClick={() => bIdx !== -1 && onLoadChapter(bIdx, p.chap)}
                  className="bg-slate-800/50 hover:bg-fuchsia-500/20 text-slate-300 hover:text-fuchsia-400 border border-slate-700/50 hover:border-fuchsia-500/50 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-start"
                >
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    {p.book} {p.chap}
                  </span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scripture Settings */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Verse Numbers
            </span>
            <button
              onClick={() => setShowVerseNumbers(!showVerseNumbers)}
              className={`px-2 py-1 text-xs font-bold rounded transition-all ${showVerseNumbers ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}
            >
              {showVerseNumbers ? "ON" : "OFF"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Translation
            </span>
            <select
              value={bibleVersion}
              onChange={(e) => setBibleVersion(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-bold outline-none focus:border-cyan-500"
            >
              <option value="kjv">KJV</option>
              <option value="web">WEB</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptureSelect;
