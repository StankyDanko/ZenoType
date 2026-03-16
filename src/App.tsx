import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Word, Difficulty, AppPhase } from "./types";
import { FINGER_MAP, SHIFT_CHARS } from "./constants/keyboard";
import { generateWords } from "./constants/sentences";
import { getThemeForTPM } from "./constants/theme";

import { useKeyStats } from "./hooks/useKeyStats";
import { useGameEngine } from "./hooks/useGameEngine";
import { useOllama } from "./hooks/useOllama";
import { useScripture } from "./hooks/useScripture";
import { useHotkeys } from "./hooks/useHotkeys";

import Header from "./components/Header";
import TopicSelect from "./components/TopicSelect";
import ScriptureSelect from "./components/ScriptureSelect";
import Analytics from "./components/Analytics";
import TypingArea from "./components/TypingArea";
import GuideHands from "./components/GuideHands";

import { Cloud } from "lucide-react";
import "./App.css";

export default function App() {
  // --- STATE OWNED BY APP ---
  const [appPhase, setAppPhase] = useState<AppPhase>("booting");
  const [words, setWords] = useState<Word[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [wordHistory, setWordHistory] = useState<boolean[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("adaptive");
  const [visibleLines, setVisibleLines] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [showHands, setShowHands] = useState(
    () => localStorage.getItem("zenotype_hands") !== "false",
  );

  // --- REFS ---
  const inputRef = useRef<HTMLInputElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- HOOK 1: KEY STATS ---
  const keyStatsHook = useKeyStats();

  // --- HOOK 2: GAME ENGINE ---
  const gameEngine = useGameEngine({
    words,
    activeWordIndex,
    currentInput,
    wordHistory,
    appPhase,
  });

  // --- HOOK 3: OLLAMA ---
  const ollama = useOllama({
    onWordsGenerated: useCallback((newWords: Word[], isReset: boolean) => {
      if (isReset) {
        setWords(newWords);
      } else {
        setWords((prev) => [...prev, ...newWords]);
      }
    }, []),
    onBootFailed: useCallback((_diff: Difficulty) => {
      // Will call startSessionOffline in effect
      startSessionOfflineRef.current("adaptive");
    }, []),
    onBootSuccess: useCallback((_initialModel: string) => {
      setAppPhase("topic-select");
    }, []),
  });

  // --- HOOK 4: SCRIPTURE ---
  const scripture = useScripture({
    ollamaEnabled: ollama.ollamaEnabled,
    selectedModel: ollama.selectedModel,
    onWordsLoaded: useCallback((newWords: Word[]) => {
      setWords(newWords);
      setActiveWordIndex(0);
      setCurrentInput("");
      setWordHistory([]);
    }, []),
    onResetGameState: gameEngine.resetGameState,
    onSetAppPhase: useCallback((phase: string) => {
      setAppPhase(phase as AppPhase);
    }, []),
  });

  // --- SESSION STARTERS ---
  const startSessionWithTopic = useCallback(
    (topic: string) => {
      ollama.abortAll();
      ollama.setActiveThread(topic);
      ollama.threadHistoryRef.current = "";

      setAppPhase("playing");
      setWords([]);
      setActiveWordIndex(0);
      setCurrentInput("");
      setWordHistory([]);
      gameEngine.resetGameState();

      ollama.fetchOllamaWords(
        {
          aggregatedKeyStats: keyStatsHook.aggregatedKeyStats,
          tpm: gameEngine.tpm,
          difficulty,
          tScore: gameEngine.tScore,
        },
        true,
        ollama.selectedModel,
        topic,
      );
    },
    [ollama, gameEngine, keyStatsHook.aggregatedKeyStats, difficulty],
  );

  const startSessionOffline = useCallback(
    (diff: Difficulty = difficulty) => {
      ollama.abortAll();

      setAppPhase("playing");
      setWords([]);
      setActiveWordIndex(0);
      setCurrentInput("");
      setWordHistory([]);
      gameEngine.resetGameState();

      setWords(generateWords(80, 0, diff));
    },
    [ollama, gameEngine, difficulty],
  );

  // Ref so boot callback can access without stale closure
  const startSessionOfflineRef = useRef(startSessionOffline);
  startSessionOfflineRef.current = startSessionOffline;

  const handleReset = useCallback(() => {
    if (difficulty === "scripture") {
      setAppPhase("topic-select");
      setWords([]);
      gameEngine.setStatus("idle");
      scripture.setScholarInsight("");
    } else if (ollama.ollamaEnabled) {
      ollama.abortAll();
      setAppPhase("topic-select");
      setWords([]);
      gameEngine.setStatus("idle");
      ollama.fetchTopicsFromOllama(ollama.selectedModel);
    } else {
      startSessionOffline(difficulty);
    }
  }, [difficulty, ollama, gameEngine, scripture, startSessionOffline]);

  // --- HOOK 5: HOTKEYS ---
  useHotkeys({
    onToggleAnalytics: useCallback(() => {
      setShowAnalytics((prev) => {
        if (!prev) gameEngine.setStatus("paused");
        return !prev;
      });
      setShowSettings(false);
    }, [gameEngine]),
    onToggleSettings: useCallback(() => {
      setShowSettings((prev) => !prev);
      setShowAnalytics(false);
    }, []),
    onToggleHands: useCallback(() => {
      setShowHands((prev) => !prev);
    }, []),
    onReset: handleReset,
    onVisibleLinesUp: useCallback(() => {
      const lines = [2, 3, 4, 5, 10];
      setVisibleLines((prev) => {
        const idx = lines.indexOf(prev);
        if (idx > 0) {
          gameEngine.setScrollOffset(0);
          return lines[idx - 1];
        }
        return prev;
      });
    }, [gameEngine]),
    onVisibleLinesDown: useCallback(() => {
      const lines = [2, 3, 4, 5, 10];
      setVisibleLines((prev) => {
        const idx = lines.indexOf(prev);
        if (idx < lines.length - 1) {
          gameEngine.setScrollOffset(0);
          return lines[idx + 1];
        }
        return prev;
      });
    }, [gameEngine]),
    getAppPhase: useCallback(() => appPhase, [appPhase]),
  });

  // --- HANDLE INPUT CHANGE ---
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      gameEngine.markKeystroke();

      const currentObj = words[activeWordIndex];
      if (!currentObj) return;
      const targetWord = currentObj.text;
      const isAddition = value.length > currentInput.length;
      if (isAddition) gameEngine.setTotalChars((prev) => prev + 1);

      if (value.endsWith(" ")) {
        const typedWord = value.trim();
        const isCorrect = typedWord === targetWord;

        if (isCorrect) {
          if (currentObj.type === "transformer") {
            gameEngine.setTScore((prev) => prev + 1);
          }

          if (soundEnabled) {
            if (!audioCtxRef.current) {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            const isSpecial = currentObj.type === "transformer" || gameEngine.tpm >= 140;
            osc.frequency.setValueAtTime(isSpecial ? 1108 : 987, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(
              isSpecial ? 1479 : 1318,
              ctx.currentTime + 0.05,
            );

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          }
        }

        // Scripture mode: detect chapter complete
        if (difficulty === "scripture" && isCorrect && activeWordIndex === words.length - 1) {
          setWordHistory((prev) => [...prev, isCorrect]);
          setActiveWordIndex((prev) => prev + 1);
          scripture.advanceBibleChapter();
          return;
        }

        setWordHistory((prev) => [...prev, isCorrect]);
        setActiveWordIndex((prev) => prev + 1);
        setCurrentInput("");
        return;
      }
      setCurrentInput(value);

      if (isAddition && value.length <= targetWord.length) {
        const expectedChar = targetWord[value.length - 1];
        const typedChar = value[value.length - 1];
        const isCharCorrect = expectedChar === typedChar;
        keyStatsHook.recordKeystroke(expectedChar, isCharCorrect);
      }
    },
    [words, activeWordIndex, currentInput, soundEnabled, difficulty, gameEngine, scripture, keyStatsHook],
  );

  // --- ACTIVE FINGERS COMPUTATION ---
  const activeFingers = useMemo(() => {
    if (
      !words[activeWordIndex] ||
      gameEngine.status === "paused" ||
      showSettings ||
      showAnalytics ||
      appPhase !== "playing"
    )
      return [];

    if (words[activeWordIndex].type === "verse-num") return [];

    const targetWord = words[activeWordIndex].text;
    const targetChar =
      currentInput.length < targetWord.length
        ? targetWord[currentInput.length]
        : " ";

    const fingers: string[] = [];
    let primaryHand: string | null = null;

    for (const [finger, chars] of Object.entries(FINGER_MAP)) {
      if (chars.includes(targetChar)) {
        primaryHand = finger.split("-")[0];
        fingers.push(finger);
        break;
      }
    }

    if (SHIFT_CHARS.has(targetChar)) {
      if (primaryHand === "l") fingers.push("r-pinky");
      else if (primaryHand === "r") fingers.push("l-pinky");
    }

    return fingers;
  }, [words, activeWordIndex, currentInput, gameEngine.status, showSettings, showAnalytics, appPhase]);

  // --- ACTIVE THEME ---
  const activeTheme = useMemo(() => getThemeForTPM(gameEngine.tpm), [gameEngine.tpm]);

  // --- EFFECTS ---

  // localStorage persistence
  useEffect(() => {
    try {
      keyStatsHook.persistKeyStats();
      localStorage.setItem("zenotype_hands", showHands.toString());
      scripture.persistScripture();
    } catch {}
  }, [keyStatsHook.persistKeyStats, showHands, scripture.persistScripture]);

  // Scroll tracking
  useEffect(() => {
    if (
      activeWordRef.current &&
      containerRef.current &&
      appPhase === "playing"
    ) {
      const top = activeWordRef.current.offsetTop;
      const firstChild = containerRef.current.firstChild as HTMLElement | null;
      if (firstChild) {
        const relativeTop = top - firstChild.offsetTop;
        const actualRowHeight = activeWordRef.current.offsetHeight + 24;

        const focusLineIndex = 1;
        if (relativeTop > actualRowHeight * focusLineIndex) {
          gameEngine.setScrollOffset(-(relativeTop - actualRowHeight * focusLineIndex));
        } else {
          gameEngine.setScrollOffset(0);
        }
      }
    }
  }, [activeWordIndex, words, appPhase, gameEngine]);

  // Word pre-fetch
  useEffect(() => {
    if (
      appPhase === "playing" &&
      words.length > 0 &&
      activeWordIndex > words.length - 40 &&
      difficulty !== "scripture"
    ) {
      if (ollama.ollamaEnabled) {
        ollama.fetchOllamaWords({
          aggregatedKeyStats: keyStatsHook.aggregatedKeyStats,
          tpm: gameEngine.tpm,
          difficulty,
          tScore: gameEngine.tScore,
        });
      } else {
        setWords((prev) => [
          ...prev,
          ...generateWords(40, gameEngine.tpm, difficulty, gameEngine.tScore >= gameEngine.flowMilestone + 5),
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWordIndex, words.length, ollama.ollamaEnabled, difficulty, appPhase]);

  // Focus input on phase change to playing
  useEffect(() => {
    if (appPhase === "playing") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [appPhase]);

  // --- SETTINGS CALLBACKS ---
  const handleDifficultyChange = useCallback(
    (newDiff: Difficulty) => {
      const oldDiff = difficulty;
      setDifficulty(newDiff);
      if (newDiff === "scripture") {
        setAppPhase("topic-select");
        setWords([]);
        gameEngine.setStatus("idle");
      } else if (oldDiff === "scripture") {
        if (ollama.ollamaEnabled) {
          setAppPhase("topic-select");
          setWords([]);
          gameEngine.setStatus("idle");
          ollama.fetchTopicsFromOllama(ollama.selectedModel);
        } else {
          startSessionOffline(newDiff);
        }
      }
    },
    [difficulty, ollama, gameEngine, startSessionOffline],
  );

  // --- COMPUTED VALUES ---
  const canvasHeight = visibleLines * 60 + 10;

  // --- SETTINGS PROPS ---
  const settingsProps = {
    selectedModel: ollama.selectedModel,
    availableModels: ollama.availableModels,
    difficulty,
    visibleLines,
    showHands,
    ollamaEnabled: ollama.ollamaEnabled,
    soundEnabled,
    onModelChange: (model: string) => {
      ollama.setSelectedModel(model);
      ollama.setOllamaEnabled(true);
    },
    onDifficultyChange: handleDifficultyChange,
    onVisibleLinesChange: (lines: number) => {
      setVisibleLines(lines);
      gameEngine.setScrollOffset(0);
      inputRef.current?.focus();
    },
    onToggleHands: () => setShowHands((prev) => !prev),
    onToggleOllama: () => ollama.setOllamaEnabled((prev) => !prev),
    onToggleSound: () => setSoundEnabled((prev) => !prev),
    onRestart: handleReset,
    inputRef,
  };

  // --- RENDER ---
  return (
    <div
      className="min-h-screen bg-[#060a11] text-slate-200 font-mono flex flex-col items-center justify-start pt-32 sm:pt-40 px-8 pb-8 overflow-hidden"
      onClick={() => {
        if (!showSettings && !showAnalytics && appPhase === "playing")
          inputRef.current?.focus();
      }}
    >
      <style>{`
        @keyframes pop-glow {
          0% { text-shadow: 0 0 20px ${activeTheme.rawGlow}; color: ${activeTheme.rawColor}; }
          100% { text-shadow: 0 0 5px rgba(100,116,139,0.2); color: #64748b; }
        }
        .animate-pop-glow { animation: pop-glow 0.4s ease-out forwards; }
      `}</style>

      {/* SOUTHERNSKY BRAND LINK */}
          <a
            href="https://southernsky.cloud"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SouthernSky"
            className="fixed top-8 left-4 z-50 flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity duration-300"
          >
            <Cloud className="w-5 h-5 text-blue-500" />
            <span className="hidden sm:inline text-sm font-bold tracking-wide text-white">
              SouthernSky
            </span>
          </a>

      {/* HEADER */}
      <Header
        tpm={gameEngine.tpm}
        accuracy={gameEngine.accuracy}
        highScore={gameEngine.highScore}
        tScore={gameEngine.tScore}
        activeTheme={activeTheme}
        ollamaEnabled={ollama.ollamaEnabled}
        ollamaError={ollama.ollamaError}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showAnalytics={showAnalytics}
        setShowAnalytics={setShowAnalytics}
        setStatus={gameEngine.setStatus as (s: string) => void}
        appPhase={appPhase}
        difficulty={difficulty}
        activeThread={ollama.activeThread}
        bibleProgress={scripture.bibleProgress}
        scholarInsight={scripture.scholarInsight}
        isFetchingScholar={scripture.isFetchingScholar}
        onReset={handleReset}
        settingsProps={settingsProps}
      />

      {/* TOPIC SELECT */}
      {appPhase === "topic-select" && difficulty !== "scripture" && (
        <TopicSelect
          dynamicSuggestions={ollama.dynamicSuggestions}
          isGeneratingTopics={ollama.isGeneratingTopics}
          customTopicInput={customTopicInput}
          setCustomTopicInput={setCustomTopicInput}
          onSelectTopic={startSessionWithTopic}
        />
      )}

      {/* SCRIPTURE SELECT */}
      {appPhase === "topic-select" && difficulty === "scripture" && (
        <ScriptureSelect
          bibleProgress={scripture.bibleProgress}
          customBibleSearch={scripture.customBibleSearch}
          setCustomBibleSearch={scripture.setCustomBibleSearch}
          bibleApiError={scripture.bibleApiError}
          showVerseNumbers={scripture.showVerseNumbers}
          setShowVerseNumbers={scripture.setShowVerseNumbers}
          bibleVersion={scripture.bibleVersion}
          setBibleVersion={scripture.setBibleVersion}
          onLoadChapter={scripture.loadBibleChapter}
          onSearch={scripture.parseBibleSearch}
        />
      )}

      {/* ANALYTICS OVERLAY */}
      {showAnalytics && (
        <Analytics
          tpm={gameEngine.tpm}
          accuracy={gameEngine.accuracy}
          totalChars={gameEngine.totalChars}
          timeMs={gameEngine.timeMs}
          tScore={gameEngine.tScore}
          aggregatedKeyStats={keyStatsHook.aggregatedKeyStats}
          chartData={gameEngine.getChartData()}
          highScore={gameEngine.highScore}
          confirmReset={confirmReset}
          setConfirmReset={setConfirmReset}
          onResetStats={keyStatsHook.resetStats}
          onClose={() => {
            setShowAnalytics(false);
            setTimeout(() => inputRef.current?.focus(), 10);
          }}
        />
      )}

      {/* TYPING AREA */}
      {appPhase === "playing" && (
        <TypingArea
          words={words}
          activeWordIndex={activeWordIndex}
          currentInput={currentInput}
          wordHistory={wordHistory}
          scrollOffset={gameEngine.scrollOffset}
          canvasHeight={canvasHeight}
          activeTheme={activeTheme}
          inputRef={inputRef}
          containerRef={containerRef}
          activeWordRef={activeWordRef}
          showSettings={showSettings}
          showAnalytics={showAnalytics}
          onInputChange={handleInputChange}
        />
      )}

      {/* GUIDE HANDS */}
      <GuideHands
        activeFingers={activeFingers}
        activeTheme={activeTheme}
        visible={showHands && appPhase === "playing"}
      />
    </div>
  );
}
