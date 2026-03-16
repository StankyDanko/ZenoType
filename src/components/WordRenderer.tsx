import React from 'react';
import type { Word, ThemeConfig } from '../types';

interface WordRendererProps {
  wordObj: Word;
  index: number;
  activeWordIndex: number;
  currentInput: string;
  wordHistory: boolean[];
  activeTheme: ThemeConfig;
  activeWordRef: React.RefObject<HTMLDivElement | null>;
}

const WordRenderer: React.FC<WordRendererProps> = ({
  wordObj,
  index,
  activeWordIndex,
  currentInput,
  wordHistory,
  activeTheme,
  activeWordRef,
}) => {
  const isActive = index === activeWordIndex;
  const isPast = index < activeWordIndex;
  const isVerseNum = wordObj.type === "verse-num";

  if (isPast) {
    if (isVerseNum)
      return (
        <div key={index} className="text-cyan-800/40 text-xl -mt-2 font-bold">
          {wordObj.text}
        </div>
      );
    return (
      <div
        key={index}
        className={
          wordHistory[index]
            ? "animate-pop-glow"
            : "text-red-900/80 line-through transition-colors"
        }
      >
        {wordObj.text}
      </div>
    );
  }
  if (isActive) {
    const isError = !wordObj.text.startsWith(currentInput);
    const maxLen = Math.max(currentInput.length, wordObj.text.length);
    const isTransformer = wordObj.type === "transformer";

    return (
      <div
        key={index}
        ref={activeWordRef}
        className={`relative flex ${isVerseNum ? "text-xl -mt-2 opacity-80 font-bold" : ""}`}
      >
        {Array.from({ length: maxLen }).map((_, i) => {
          const t = wordObj.text[i];
          const typed = currentInput[i];

          let c = isTransformer
            ? "text-fuchsia-400 font-bold"
            : isVerseNum
              ? "text-cyan-500"
              : "text-slate-500";
          if (typed)
            c = t === typed ? "text-slate-200" : "text-red-400 bg-red-400/20";
          return (
            <span key={i} className={`relative ${c}`}>
              {t || typed}
              {i === currentInput.length && (
                <span
                  className={`absolute left-0 -bottom-1 w-full h-[3px] rounded-full ${isError ? "bg-red-500" : activeTheme.bg}`}
                />
              )}
            </span>
          );
        })}
        {currentInput.length === maxLen && (
          <span
            className={`absolute -right-[1ch] -bottom-1 w-[1ch] h-[3px] rounded-full ${isError ? "bg-red-500" : activeTheme.bg}`}
          />
        )}
      </div>
    );
  }

  let futureColor = "text-slate-600";
  if (isVerseNum) futureColor = "text-cyan-700/50 text-xl -mt-2 font-bold";
  else if (wordObj.type === "transformer")
    futureColor = "text-fuchsia-900/60 font-bold";
  else if (wordObj.type === "syntax" || wordObj.type === "code")
    futureColor = "text-indigo-800/60";
  return (
    <div key={index} className={`transition-colors ${futureColor}`}>
      {wordObj.text}
    </div>
  );
};

export default WordRenderer;
