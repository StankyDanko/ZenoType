import { useState, useRef, useEffect, useCallback } from 'react';
import type { Word, GameStatus } from '../types';

interface UseGameEngineProps {
  words: Word[];
  activeWordIndex: number;
  currentInput: string;
  wordHistory: boolean[];
  appPhase: string;
}

export function useGameEngine({
  words,
  activeWordIndex,
  currentInput,
  wordHistory,
  appPhase,
}: UseGameEngineProps) {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [timeMs, setTimeMs] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [tScore, setTScore] = useState(0);
  const [flowMilestone, setFlowMilestone] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("zenotype_tpm_high") as string) || 0;
    } catch {
      return 0;
    }
  });

  const lastKeystrokeRef = useRef(Date.now());
  const cumulativeTimeRef = useRef(0);
  const historyRef = useRef<number[]>([]);
  const currentStatsRef = useRef({ chars: 0, time: 0 });

  // --- RIGOROUS TPM MATH ---
  const completedCorrectChars = words
    .slice(0, activeWordIndex)
    .reduce(
      (sum, wordObj, idx) =>
        sum + (wordHistory[idx] ? wordObj.text.length + 1 : 0),
      0,
    );
  let activeCorrectChars = 0;
  const activeTargetWord = words[activeWordIndex]?.text || "";
  for (let i = 0; i < currentInput.length; i++) {
    if (currentInput[i] === activeTargetWord[i]) activeCorrectChars++;
    else break;
  }
  const trueCorrectChars = completedCorrectChars + activeCorrectChars;
  const tpm =
    timeMs > 1500 ? Math.round(trueCorrectChars / 4 / (timeMs / 60000)) : 0;
  const accuracy =
    totalChars > 0 ? Math.round((trueCorrectChars / totalChars) * 100) : 100;

  useEffect(() => {
    currentStatsRef.current = { chars: trueCorrectChars, time: timeMs };
  }, [trueCorrectChars, timeMs]);

  // --- HIGH SCORE ---
  useEffect(() => {
    if (tpm > highScore && tpm > 0) {
      setHighScore(tpm);
      try {
        localStorage.setItem("zenotype_tpm_high", tpm.toString());
      } catch {}
    }
  }, [tpm, highScore]);

  // --- TIMER ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (status === 'typing') {
      let lastTick = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const idleTime = now - lastKeystrokeRef.current;
        if (idleTime > 2000) setStatus('paused');
        else {
          const tickDelta = now - lastTick;
          cumulativeTimeRef.current += tickDelta;
          setTimeMs(cumulativeTimeRef.current);

          if (
            Math.floor(cumulativeTimeRef.current / 1000) >
            historyRef.current.length
          ) {
            const currentTpm =
              cumulativeTimeRef.current > 1500
                ? Math.round(
                    currentStatsRef.current.chars /
                      4 /
                      (cumulativeTimeRef.current / 60000),
                  )
                : 0;
            historyRef.current.push(currentTpm);
          }
        }
        lastTick = now;
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // --- DYNAMIC CHART DOWNSAMPLING ---
  const getChartData = useCallback(() => {
    let chartData = [...historyRef.current];
    const maxColumns = 60;
    if (chartData.length > maxColumns) {
      const bucketSize = chartData.length / maxColumns;
      const downsampled: number[] = [];
      for (let i = 0; i < maxColumns; i++) {
        const start = Math.floor(i * bucketSize);
        const end = Math.floor((i + 1) * bucketSize);
        const chunk = chartData.slice(start, end);
        if (chunk.length > 0) {
          const sum = chunk.reduce((a, b) => a + b, 0);
          downsampled.push(Math.round(sum / chunk.length));
        } else {
          downsampled.push(0);
        }
      }
      chartData = downsampled;
    }
    return chartData;
  }, []);

  const resetGameState = useCallback(() => {
    setStatus('idle');
    setTimeMs(0);
    setTotalChars(0);
    setTScore(0);
    setFlowMilestone(0);
    setScrollOffset(0);
    cumulativeTimeRef.current = 0;
    historyRef.current = [];
    lastKeystrokeRef.current = Date.now();
  }, []);

  const markKeystroke = useCallback(() => {
    lastKeystrokeRef.current = Date.now();
    setStatus((prev) => {
      if (prev === 'idle' || prev === 'paused') return 'typing';
      return prev;
    });
  }, []);

  return {
    status,
    setStatus,
    timeMs,
    setTimeMs,
    totalChars,
    setTotalChars,
    tScore,
    setTScore,
    flowMilestone,
    setFlowMilestone,
    highScore,
    setHighScore,
    scrollOffset,
    setScrollOffset,
    tpm,
    accuracy,
    getChartData,
    resetGameState,
    markKeystroke,
    lastKeystrokeRef,
    cumulativeTimeRef,
    historyRef,
    currentStatsRef,
  };
}
