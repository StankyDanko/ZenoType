import React from 'react';
import { BrainCircuit } from 'lucide-react';
import type { Word, ThemeConfig } from '../types';
import WordRenderer from './WordRenderer';

interface TypingAreaProps {
  words: Word[];
  activeWordIndex: number;
  currentInput: string;
  wordHistory: boolean[];
  scrollOffset: number;
  canvasHeight: number;
  activeTheme: ThemeConfig;
  inputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeWordRef: React.RefObject<HTMLDivElement | null>;
  showSettings: boolean;
  showAnalytics: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({
  words,
  activeWordIndex,
  currentInput,
  wordHistory,
  scrollOffset,
  canvasHeight,
  activeTheme,
  inputRef,
  containerRef,
  activeWordRef,
  showSettings,
  showAnalytics,
  onInputChange,
}) => {
  return (
    <main className="w-full max-w-5xl relative px-8 mt-6">
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={onInputChange}
        className="absolute opacity-0 w-0 h-0"
        autoComplete="off"
        autoFocus
        disabled={showSettings || showAnalytics}
      />

      <div
        className="relative w-full overflow-hidden transition-all duration-500"
        style={{ height: `${canvasHeight}px` }}
      >
        <div
          className={`absolute top-0 w-full h-8 bg-gradient-to-b from-[#060a11] to-transparent z-10 pointer-events-none transition-opacity duration-500 ${scrollOffset < 0 ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-[#060a11] to-transparent z-10 pointer-events-none" />

        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse text-xl">
            <BrainCircuit className="w-6 h-6 mb-3 animate-spin text-cyan-400" />
            Initializing Neural Context...
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex flex-wrap gap-x-4 gap-y-6 text-3xl sm:text-4xl font-medium transition-transform duration-300 ease-out"
            style={{ transform: `translateY(${scrollOffset}px)` }}
          >
            {words.map((w, i) => (
              <WordRenderer
                key={i}
                wordObj={w}
                index={i}
                activeWordIndex={activeWordIndex}
                currentInput={currentInput}
                wordHistory={wordHistory}
                activeTheme={activeTheme}
                activeWordRef={activeWordRef}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default TypingArea;
