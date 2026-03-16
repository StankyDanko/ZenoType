import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  RefreshCw,
  Volume2,
  VolumeX,
  Cpu,
  Trophy,
  BrainCircuit,
  Settings2,
  BarChart2,
  X,
  Zap,
  Hand,
  AlignLeft,
  BookOpen,
  ScrollText,
  Search,
  ChevronRight,
} from "lucide-react";

// --- GAME ASSETS & FALLBACK PARAGRAPHS ---
const SENTENCES_STANDARD = [
  "The rapid advancement of artificial intelligence is transforming how we interact with technology daily.",
  "Cloud computing allows developers to deploy scalable applications without managing physical hardware servers.",
  "A well-designed database architecture ensures fast query performance and reliable data integrity.",
  "User experience design focuses on creating intuitive interfaces that delight and guide the customer.",
  "Machine learning models require vast amounts of clean training data to reduce bias and improve accuracy.",
];

const SENTENCES_CODE = [
  "When using React, the useEffect hook is essential for managing side effects and fetching async data.",
  "The initializeApp() function must be called before trying to access the firestoreDb instance.",
  "We defined a userProfile object to store the payload returned by the authenticateUser() method.",
  "Make sure to wrap your await calls inside a tryCatch block to gracefully handle api_errors.",
  "The map() function creates a new array populated with the results of calling a provided function.",
];

const SENTENCES_SYNTAX = [
  "function init(opts = { debug: false }) { return Object.keys(opts).length > 0; }",
  "const calculate_entropy = (p) => -p * Math.log2(p) - (1-p) * Math.log2(1-p);",
  "if (res.status === 200 && res.data !== null) { yield* parse_stream(res.data); }",
  "export const Module = <T extends Node>(element: T): void => { element.mount(); };",
  "regex.match(/^[a-zA-Z0-9]+$/) ? true : throw new Error('Invalid Syntax');",
];

const HALLUCINATIONS = [
  "blorpaglorp",
  "snargle",
  "fizzbang",
  "glipglop",
  "zizzbot",
];

// --- BIBLICAL ARCHITECTURE MAP ---
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

const CHAPTER_COUNTS = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150,
  31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16,
  24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1,
  22,
];

const CURATED_PASSAGES = [
  { label: "The Beginning", book: "Genesis", chap: 1 },
  { label: "The Shepherd", book: "Psalms", chap: 23 },
  { label: "The Beatitudes", book: "Matthew", chap: 5 },
  { label: "The Word Made Flesh", book: "John", chap: 1 },
  { label: "Life in the Spirit", book: "Romans", chap: 8 },
  { label: "The Hall of Faith", book: "Hebrews", chap: 11 },
  { label: "The Suffering Servant", book: "Isaiah", chap: 53 },
  { label: "The New Jerusalem", book: "Revelation", chap: 21 },
];

// Expanded QWERTY Layout for Heatmap
const KEYBOARD_ROWS = [
  ["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

// Touch-Typing Finger Map
const FINGER_MAP = {
  "l-pinky": ["1", "q", "a", "z", "!", "Q", "A", "Z", "~", "`"],
  "l-ring": ["2", "w", "s", "x", "@", "W", "S", "X"],
  "l-middle": ["3", "e", "d", "c", "#", "E", "D", "C"],
  "l-index": [
    "4",
    "5",
    "r",
    "t",
    "f",
    "g",
    "v",
    "b",
    "$",
    "%",
    "R",
    "T",
    "F",
    "G",
    "V",
    "B",
  ],
  thumbs: [" "],
  "r-index": [
    "6",
    "7",
    "y",
    "u",
    "h",
    "j",
    "n",
    "m",
    "^",
    "&",
    "Y",
    "U",
    "H",
    "J",
    "N",
    "M",
  ],
  "r-middle": ["8", "i", "k", ",", "*", "I", "K", "<"],
  "r-ring": ["9", "o", "l", ".", "(", "O", "L", ">"],
  "r-pinky": [
    "0",
    "p",
    ";",
    "/",
    "-",
    "=",
    "[",
    "]",
    "'",
    "\\",
    ")",
    "P",
    ":",
    "?",
    "_",
    "+",
    "{",
    "}",
    '"',
    "|",
  ],
};
const SHIFT_CHARS = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:"<>?');

// --- FALLBACK TOPIC POOL (Used if Ollama fails to generate topics) ---
const FALLBACK_TOPIC_POOL = [
  "The Bizarre Economics of Speedrunning",
  "Psychological Warfare in 90s Mall Design",
  "The Existential Dread of the Taco Bell Menu",
  "Unsolved Mysteries of Early Internet Forums",
  "Why Crab Evolution Keeps Happening (Carcinization)",
  "The Cutthroat World of Competitive Excel",
  "The Absurd History of the McRib",
  "Deep Lore of the Windows XP Pinball Space Cadet",
  "How to Survive a Zombie Apocalypse using Middle School Science",
  "The Philosophy of Liminal Spaces",
  "Why Everyone is Obsessed with Capybaras",
  "The Geopolitics of Maple Syrup",
  "Accidental Cults in MMORPGs",
  "The Strange Phenomenon of Phantom Vibrations",
  "An Analysis of 2010s Ringtone Rap",
  "Why Pigeons Are Actually Secretly Geniuses",
];

const getRandomFallbackTopics = (count = 8) => {
  const shuffled = [...FALLBACK_TOPIC_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateWords = (
  count = 60,
  tpm = 0,
  difficulty = "adaptive",
  forceFlow = false,
) => {
  let wordPool = [];
  while (wordPool.length < count) {
    let diffTarget = difficulty;
    if (difficulty === "adaptive") {
      diffTarget = tpm > 100 ? "syntax" : tpm > 60 ? "code" : "standard";
    }

    let sentence = "";
    if (forceFlow) {
      sentence =
        "finding your rhythm is the key to achieving a true zen state of mind where your fingers simply fly across the keyboard";
    } else if (diffTarget === "syntax") {
      sentence =
        SENTENCES_SYNTAX[Math.floor(Math.random() * SENTENCES_SYNTAX.length)];
    } else if (diffTarget === "code") {
      sentence =
        SENTENCES_CODE[Math.floor(Math.random() * SENTENCES_CODE.length)];
    } else {
      sentence =
        SENTENCES_STANDARD[
          Math.floor(Math.random() * SENTENCES_STANDARD.length)
        ];
    }

    const sentenceWords = sentence.split(" ").map((w) => {
      const isTransformer = Math.random() < 0.05;
      return { type: isTransformer ? "transformer" : diffTarget, text: w };
    });

    wordPool = [...wordPool, ...sentenceWords];
  }
  return wordPool.slice(0, count);
};

export default function App() {
  // --- STATE ---
  const [appPhase, setAppPhase] = useState("booting");
  const [words, setWords] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [wordHistory, setWordHistory] = useState([]);

  // Stats & Metagame
  const [status, setStatus] = useState("idle");
  const [timeMs, setTimeMs] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [tScore, setTScore] = useState(0);
  const [flowMilestone, setFlowMilestone] = useState(0);

  // Settings & Profiles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHands, setShowHands] = useState(
    () => localStorage.getItem("zenotype_hands") !== "false",
  );
  const [visibleLines, setVisibleLines] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("zenotype_tpm_high")) || 0;
    } catch {
      return 0;
    }
  });

  // Persistent Key Accuracy Tracking
  const [keyStats, setKeyStats] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zenotype_keystats")) || {};
      if (
        Object.values(saved).length > 0 &&
        typeof Object.values(saved)[0] === "number"
      )
        return {};
      return saved;
    } catch {
      return {};
    }
  });

  const aggregatedKeyStats = useMemo(() => {
    const agg = {};
    Object.entries(keyStats).forEach(([k, v]) => {
      const lowerK = k.toLowerCase();
      if (!agg[lowerK]) agg[lowerK] = { hits: 0, misses: 0 };
      agg[lowerK].hits += v.hits;
      agg[lowerK].misses += v.misses;
    });
    return agg;
  }, [keyStats]);

  // Ollama Integrations
  const [ollamaEnabled, setOllamaEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [ollamaError, setOllamaError] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("zenotype:latest");
  const [difficulty, setDifficulty] = useState("adaptive");

  // --- SCRIPTURE MODE STATE ---
  const [showVerseNumbers, setShowVerseNumbers] = useState(
    () => localStorage.getItem("zenotype_versenums") !== "false",
  );
  const [bibleVersion, setBibleVersion] = useState(
    () => localStorage.getItem("zenotype_version") || "kjv",
  );
  const [bibleProgress, setBibleProgress] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zenotype_bible_progress"));
      if (saved && typeof saved.bookIdx === "number") return saved;
      return { bookIdx: 0, chapter: 1 };
    } catch {
      return { bookIdx: 0, chapter: 1 };
    }
  });
  const [scholarInsight, setScholarInsight] = useState("");
  const [isFetchingScholar, setIsFetchingScholar] = useState(false);
  const [customBibleSearch, setCustomBibleSearch] = useState("");
  const [bibleApiError, setBibleApiError] = useState("");

  // --- NEURAL THREAD ENGINE STATE ---
  const [activeThread, setActiveThread] = useState("");
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [dynamicSuggestions, setDynamicSuggestions] = useState([]);
  const threadHistoryRef = useRef("");

  // --- AGGRESSIVE ABORT CONTROLLERS ---
  const generateAbortControllerRef = useRef(null);
  const topicAbortControllerRef = useRef(null);

  const inputRef = useRef(null);
  const activeWordRef = useRef(null);
  const containerRef = useRef(null);
  const lastKeystrokeRef = useRef(Date.now());
  const cumulativeTimeRef = useRef(0);

  const historyRef = useRef([]);
  const currentStatsRef = useRef({ chars: 0, time: 0 });
  const [resetTrigger, setResetTrigger] = useState(0);

  const stateRefs = useRef({ visibleLines, showHands, appPhase });
  useEffect(() => {
    stateRefs.current = { visibleLines, showHands, appPhase };
  }, [visibleLines, showHands, appPhase]);

  // --- GLOBAL HOTKEYS ---
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "Enter" && stateRefs.current.appPhase === "playing") {
        e.preventDefault();
        setShowAnalytics((prev) => {
          if (!prev) {
            setStatus("paused");
            return true;
          } else {
            setTimeout(() => inputRef.current?.focus(), 10);
            return false;
          }
        });
        setShowSettings(false);
      }

      if (e.altKey) {
        const key = e.key.toLowerCase();

        if (key === "o") {
          e.preventDefault();
          setShowSettings((prev) => !prev);
          setShowAnalytics(false);
        } else if (key === "s") {
          e.preventDefault();
          setShowAnalytics((prev) => {
            if (!prev) setStatus("paused");
            return !prev;
          });
          setShowSettings(false);
        } else if (key === "h") {
          e.preventDefault();
          setShowHands((prev) => !prev);
        } else if (key === "r") {
          e.preventDefault();
          setResetTrigger((prev) => prev + 1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const lines = [2, 3, 4, 5, 10];
          const currIdx = lines.indexOf(stateRefs.current.visibleLines);
          if (currIdx < lines.length - 1) {
            setVisibleLines(lines[currIdx + 1]);
            setScrollOffset(0);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const lines = [2, 3, 4, 5, 10];
          const currIdx = lines.indexOf(stateRefs.current.visibleLines);
          if (currIdx > 0) {
            setVisibleLines(lines[currIdx - 1]);
            setScrollOffset(0);
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (resetTrigger > 0) {
      if (difficulty === "scripture") {
        setAppPhase("topic-select");
        setWords([]);
        setStatus("idle");
        setScholarInsight("");
      } else if (ollamaEnabled) {
        if (generateAbortControllerRef.current)
          generateAbortControllerRef.current.abort();
        if (topicAbortControllerRef.current)
          topicAbortControllerRef.current.abort();

        setAppPhase("topic-select");
        setWords([]);
        setStatus("idle");
        fetchTopicsFromOllama(selectedModel);
      } else {
        startSessionOffline(difficulty);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  // --- DYNAMIC TOPIC GENERATOR ---
  const fetchTopicsFromOllama = async (modelName) => {
    if (topicAbortControllerRef.current)
      topicAbortControllerRef.current.abort();
    const controller = new AbortController();
    topicAbortControllerRef.current = controller;

    setIsGeneratingTopics(true);
    setDynamicSuggestions([]);

    try {
      const seed = Math.floor(Math.random() * 100000);
      const promptPayload = `Generate a comma-separated list of exactly 8 highly diverse, incredibly niche, and slightly absurd topics.
      The vibe should appeal to a 25-year-old American who loves internet culture, obscure history, nuance, and has a great sense of humor.
      
      DO NOT USE THESE EXACT PHRASES, but here is the vibe to aim for: "The psychology of 90s mall aesthetics", "The cutthroat world of competitive Excel", "Existential dread in the Taco Bell drive-thru", "Why evolution keeps turning things into crabs".
      
      CRITICAL RULES:
      1. NO numbering or bullet points.
      2. NO introductory text or conversational filler (e.g., 'Here are the topics').
      3. Output ONLY the topics separated by commas.
      4. DO NOT output the words "Quantum Physics".
      5. DO NOT use underscores to separate words. Use regular spaces.
      Random Seed: ${seed}`;

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          prompt: promptPayload,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Ollama Offline");
      const data = await response.json();

      const parsedTopics = data.response
        .split(",")
        .map((t) =>
          t
            .trim()
            .replace(/['"]/g, "")
            .replace(/^[*-]\s*/, "")
            .replace(/_/g, " "),
        ) // Violently rip out underscores
        .filter((t) => t.length > 0 && t.length < 50)
        .slice(0, 8);

      if (parsedTopics.length >= 4) {
        setDynamicSuggestions(parsedTopics);
      } else {
        throw new Error("Sanitization failed to produce enough topics");
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      console.warn(
        "Topic Generation Error. Using fallback curated pool.",
        error,
      );
      setDynamicSuggestions(getRandomFallbackTopics(8));
    } finally {
      if (topicAbortControllerRef.current === controller) {
        setIsGeneratingTopics(false);
      }
    }
  };

  // --- AI-FIRST BOOT SEQUENCE ---
  useEffect(() => {
    let mounted = true;
    fetch("http://localhost:11434/api/tags")
      .then((res) => res.json())
      .then((data) => {
        if (data.models && data.models.length > 0 && mounted) {
          const modelNames = data.models.map((m) => m.name);
          setAvailableModels(modelNames);

          let initialModel = modelNames[0];
          if (modelNames.includes("zenotype:latest"))
            initialModel = "zenotype:latest";
          else if (modelNames.includes("zenotype")) initialModel = "zenotype";
          else if (modelNames.includes("zentype:latest"))
            initialModel = "zentype:latest";
          else if (modelNames.includes("llama3.2:3b"))
            initialModel = "llama3.2:3b";

          setSelectedModel(initialModel);
          setOllamaEnabled(true);
          setAppPhase("topic-select");
          fetchTopicsFromOllama(initialModel);
        } else {
          throw new Error("No models detected");
        }
      })
      .catch(() => {
        if (mounted) {
          console.warn("Ollama not detected. Defaulting to local buffer.");
          setOllamaEnabled(false);
          startSessionOffline(difficulty);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Save Configs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("zenotype_keystats", JSON.stringify(keyStats));
      localStorage.setItem("zenotype_hands", showHands.toString());
      localStorage.setItem("zenotype_versenums", showVerseNumbers.toString());
      localStorage.setItem("zenotype_version", bibleVersion);
      localStorage.setItem("zenotype_bible_progress", JSON.stringify(bibleProgress));
    } catch {}
  }, [keyStats, showHands, showVerseNumbers, bibleVersion, bibleProgress]);

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

  // --- SUPER SAIYAN HEAT ENGINE ---
  let themeName = "cyan";
  let themeColor = "#22d3ee";
  let glowColor = "rgba(34,211,238,1)";
  if (tpm >= 140) {
    themeName = "fuchsia";
    themeColor = "#e879f9";
    glowColor = "rgba(232,121,249,1)";
  } else if (tpm >= 130) {
    themeName = "rose";
    themeColor = "#fb7185";
    glowColor = "rgba(251,113,133,1)";
  } else if (tpm >= 120) {
    themeName = "orange";
    themeColor = "#fb923c";
    glowColor = "rgba(251,146,60,1)";
  } else if (tpm >= 110) {
    themeName = "amber";
    themeColor = "#fbbf24";
    glowColor = "rgba(251,191,36,1)";
  } else if (tpm >= 100) {
    themeName = "yellow";
    themeColor = "#facc15";
    glowColor = "rgba(250,204,21,1)";
  } else if (tpm >= 90) {
    themeName = "emerald";
    themeColor = "#34d399";
    glowColor = "rgba(52,211,153,1)";
  } else if (tpm >= 80) {
    themeName = "green";
    themeColor = "#4ade80";
    glowColor = "rgba(74,222,128,1)";
  }

  const themeClasses = {
    cyan: {
      text: "text-cyan-400",
      bg: "bg-cyan-400",
      glow: "shadow-[0_0_12px_rgba(34,211,238,0.6)]",
    },
    green: {
      text: "text-green-400",
      bg: "bg-green-400",
      glow: "shadow-[0_0_12px_rgba(74,222,128,0.6)]",
    },
    emerald: {
      text: "text-emerald-400",
      bg: "bg-emerald-400",
      glow: "shadow-[0_0_12px_rgba(52,211,153,0.6)]",
    },
    yellow: {
      text: "text-yellow-400",
      bg: "bg-yellow-400",
      glow: "shadow-[0_0_12px_rgba(250,204,21,0.6)]",
    },
    amber: {
      text: "text-amber-400",
      bg: "bg-amber-400",
      glow: "shadow-[0_0_12px_rgba(251,191,36,0.6)]",
    },
    orange: {
      text: "text-orange-400",
      bg: "bg-orange-400",
      glow: "shadow-[0_0_12px_rgba(251,146,60,0.6)]",
    },
    rose: {
      text: "text-rose-400",
      bg: "bg-rose-400",
      glow: "shadow-[0_0_12px_rgba(251,113,133,0.6)]",
    },
    fuchsia: {
      text: "text-fuchsia-400 font-black animate-pulse",
      bg: "bg-fuchsia-400",
      glow: "shadow-[0_0_15px_rgba(232,121,249,0.8)]",
    },
  };
  const activeTheme = themeClasses[themeName];

  // --- SMART OLLAMA EDUCATOR ENGINE ---
  const fetchOllamaWords = async (
    isReset = false,
    modelOverride = selectedModel,
    specificThread = activeThread,
  ) => {
    if (isGenerating && !isReset) return;
    if (!ollamaEnabled && !isReset) return;

    if (isReset && generateAbortControllerRef.current) {
      generateAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    generateAbortControllerRef.current = controller;

    setIsGenerating(true);
    setOllamaError("");

    try {
      const worstKeys = Object.entries(aggregatedKeyStats)
        .map(([k, v]) => ({
          key: k,
          acc: v.hits / (v.hits + v.misses),
          total: v.hits + v.misses,
        }))
        .filter((k) => k.total >= 3 && k.acc < 1)
        .sort((a, b) => a.acc - b.acc)
        .slice(0, 4)
        .map((k) => k.key);

      const seed = Math.floor(Math.random() * 10000);

      const isFlowState = tScore >= flowMilestone + 5;
      if (isFlowState) setFlowMilestone((prev) => prev + 5);

      const tone =
        tpm > 120
          ? "urgent, fast-paced, and highly technical"
          : tpm > 70
            ? "informative and analytical"
            : "calm, methodical, and accessible";

      let contextModifier =
        "Write standard, engaging, grammatical English prose.";
      if (
        difficulty === "code" ||
        (difficulty === "adaptive" && tpm > 60 && tpm <= 100)
      ) {
        contextModifier =
          "Write standard English prose, but substitute key concepts and nouns with camelCaseVariables and snake_case_terms.";
      } else if (
        difficulty === "syntax" ||
        (difficulty === "adaptive" && tpm > 100)
      ) {
        contextModifier =
          "Write flowing English prose, but aggressively pepper the sentences with programming symbols like {}, [], (), &&, ||, and ===. Substitute some nouns with camelCase.";
      }

      let promptPayload = isFlowState
        ? `Write a highly rhythmic, calming, and flowing paragraph (3 to 4 sentences) about ${specificThread}.
          CRITICAL RULES:
          1. MUST be entirely lowercase.
          2. MUST NOT contain ANY punctuation or numbers.
          3. DO NOT output conversational filler like 'Here is the paragraph'.
          4. Output ONLY the raw text to give the user a smooth speed boost.
          Seed: ${seed}`
        : `${threadHistoryRef.current ? `CONTINUE the educational narrative about ${specificThread} seamlessly. Context to continue from: "...${threadHistoryRef.current}"` : `You are an expert educator. Write a fascinating paragraph (3 to 4 sentences) teaching the user about ${specificThread}.`}
          
          Difficulty Formatting Requirement: ${contextModifier}
          Tone Constraint: ${tone}.
          
          CRITICAL RULES:
          1. DO NOT use markdown, asterisks, or bold text.
          2. DO NOT output conversational filler like 'Here is the paragraph' or 'Sure'.
          3. DO NOT start the paragraph with cliches like 'As a...', 'In the world of...'. Jump right into the facts.
          4. Output ONLY the raw educational paragraph text.
          5. DO NOT output meta-text or system messages.
          Seed: ${seed}`;

      if (worstKeys.length > 0 && !isFlowState) {
        promptPayload += `\n6. Naturally incorporate words that contain these specific characters to help the user practice their weak points: ${worstKeys.join(", ")}`;
      }

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelOverride,
          prompt: promptPayload,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Ollama Offline");
      const data = await response.json();

      let cleanText = data.response
        .replace(/<\|.*?\|>/g, "")
        .replace(/[*_`#]/g, "")
        .replace(
          /(here is|here are|sure|certainly|generated paragraph|typing buffer).*?\n/gi,
          "",
        )
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[^\x20-\x7E\n]/g, "")
        .trim();

      const parsedWords = cleanText
        .split(/\s+/)
        .filter((w) => w.length > 0)
        .slice(0, 50)
        .map((w) => {
          const isTransformer = Math.random() < 0.05;
          return { type: isTransformer ? "transformer" : "ollama", text: w };
        });

      if (parsedWords.length === 0)
        throw new Error("Sanitization empty response");

      // Expanded memory slice to 15 words to prevent logical drift
      const lastWords = parsedWords
        .slice(-15)
        .map((w) => w.text)
        .join(" ");
      threadHistoryRef.current = lastWords;

      if (isReset) {
        setWords(parsedWords);
      } else {
        setWords((prev) => [...prev, ...parsedWords]);
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error(error);
      setOllamaError("Generation Error. Falling back.");

      const isFlowState = tScore >= flowMilestone + 5;
      if (isFlowState) setFlowMilestone((prev) => prev + 5);

      if (isReset) {
        setWords(generateWords(60, tpm, difficulty, isFlowState));
      } else {
        setWords((prev) => [
          ...prev,
          ...generateWords(40, tpm, difficulty, isFlowState),
        ]);
      }
      setTimeout(() => setOllamaError(""), 4000);
    } finally {
      if (generateAbortControllerRef.current === controller) {
        setIsGenerating(false);
      }
    }
  };

  // --- SESSION STARTERS ---
  const startSessionWithTopic = (topic) => {
    if (topicAbortControllerRef.current)
      topicAbortControllerRef.current.abort();
    if (generateAbortControllerRef.current)
      generateAbortControllerRef.current.abort();

    setActiveThread(topic);
    setAppPhase("playing");
    setWords([]);
    setActiveWordIndex(0);
    setCurrentInput("");
    setWordHistory([]);
    setStatus("idle");
    setTimeMs(0);
    setTScore(0);
    setFlowMilestone(0);
    cumulativeTimeRef.current = 0;
    historyRef.current = [];
    setTotalChars(0);
    setScrollOffset(0);
    lastKeystrokeRef.current = Date.now();
    threadHistoryRef.current = "";

    fetchOllamaWords(true, selectedModel, topic);
  };

  const startSessionOffline = (diff = difficulty) => {
    if (topicAbortControllerRef.current)
      topicAbortControllerRef.current.abort();
    if (generateAbortControllerRef.current)
      generateAbortControllerRef.current.abort();

    setAppPhase("playing");
    setWords([]);
    setActiveWordIndex(0);
    setCurrentInput("");
    setWordHistory([]);
    setStatus("idle");
    setTimeMs(0);
    setTScore(0);
    setFlowMilestone(0);
    cumulativeTimeRef.current = 0;
    historyRef.current = [];
    setTotalChars(0);
    setScrollOffset(0);
    lastKeystrokeRef.current = Date.now();
    threadHistoryRef.current = "";

    setWords(generateWords(80, 0, diff));
  };

  // --- SCRIPTURE MODE FUNCTIONS ---
  const fetchScholarInsight = async (book, chapter) => {
    if (!ollamaEnabled) return;
    setIsFetchingScholar(true);
    setScholarInsight("");
    try {
      const promptPayload = `The user is about to type ${book} chapter ${chapter}. Provide a fascinating, deeply scholarly 2-sentence insight into the historical context, original Greek/Hebrew/Aramaic translation nuances, or theological significance of this specific chapter.`;

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: promptPayload,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error("Scholar Offline");
      const data = await response.json();
      setScholarInsight(data.response.replace(/[*_~`#]/g, "").trim());
    } catch (e) {
      console.warn("Scholar AI is offline or unavailable.");
    } finally {
      setIsFetchingScholar(false);
    }
  };

  const loadBibleChapter = async (
    bIdx,
    cNum,
    ver = bibleVersion,
    verseNums = showVerseNumbers,
  ) => {
    setAppPhase("playing");
    setActiveWordIndex(0);
    setCurrentInput("");
    setWordHistory([]);
    setStatus("idle");
    setTimeMs(0);
    setTScore(0);
    setFlowMilestone(0);
    cumulativeTimeRef.current = 0;
    historyRef.current = [];
    setTotalChars(0);
    setScrollOffset(0);
    lastKeystrokeRef.current = Date.now();
    setBibleApiError("");
    setWords([]);

    const bookName = BIBLE_BOOKS[bIdx];

    try {
      const res = await fetch(
        `https://bible-api.com/${bookName}+${cNum}?translation=${ver}`,
      );
      if (!res.ok) throw new Error("Failed to fetch Scripture from API.");
      const data = await res.json();

      let newWords = [];
      data.verses.forEach((v) => {
        if (verseNums) {
          newWords.push({ type: "verse-num", text: `${v.verse}` });
        }

        const cleanText = v.text
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const verseWords = cleanText
          .split(" ")
          .filter((w) => w.length > 0)
          .map((w) => {
            const isTransformer = Math.random() < 0.05 && w.length > 3;
            return {
              type: isTransformer ? "transformer" : "standard",
              text: w,
            };
          });
        newWords = [...newWords, ...verseWords];
      });

      setBibleProgress({ bookIdx: bIdx, chapter: cNum });
      setWords(newWords);

      fetchScholarInsight(bookName, cNum);
    } catch (e) {
      console.error(e);
      setBibleApiError(
        "Unable to connect to Bible API. Please check your internet.",
      );
      setAppPhase("topic-select");
    }
  };

  const advanceBibleChapter = () => {
    let nextChap = bibleProgress.chapter + 1;
    let nextBookIdx = bibleProgress.bookIdx;

    if (nextChap > CHAPTER_COUNTS[nextBookIdx]) {
      nextChap = 1;
      nextBookIdx++;
    }

    if (nextBookIdx >= BIBLE_BOOKS.length) {
      alert("Incredible. You have typed through the entire Bible.");
      return;
    }

    loadBibleChapter(nextBookIdx, nextChap);
  };

  const parseBibleSearch = () => {
    const str = customBibleSearch.trim().toLowerCase();
    if (!str) return;

    let targetBookIdx = -1;
    let targetChapter = 1;

    for (let i = 0; i < BIBLE_BOOKS.length; i++) {
      if (str.startsWith(BIBLE_BOOKS[i].toLowerCase())) {
        targetBookIdx = i;
        const remainder = str.replace(BIBLE_BOOKS[i].toLowerCase(), "").trim();
        const match = remainder.match(/^(\d+)/);
        if (match) targetChapter = parseInt(match[1], 10);
        break;
      }
    }

    if (targetBookIdx !== -1) {
      if (targetChapter > CHAPTER_COUNTS[targetBookIdx])
        targetChapter = CHAPTER_COUNTS[targetBookIdx];
      if (targetChapter < 1) targetChapter = 1;
      loadBibleChapter(targetBookIdx, targetChapter);
    } else {
      setBibleApiError("Could not find that book. Try 'John 3' or 'Genesis 1'.");
    }
  };

  // --- GAME LOOPS ---
  useEffect(() => {
    if (tpm > highScore && tpm > 0) {
      setHighScore(tpm);
      try {
        localStorage.setItem("zenotype_tpm_high", tpm.toString());
      } catch {}
    }
  }, [tpm, highScore]);

  useEffect(() => {
    let interval = null;
    if (status === "typing") {
      let lastTick = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const idleTime = now - lastKeystrokeRef.current;
        if (idleTime > 2000) setStatus("paused");
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
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (
      appPhase === "playing" &&
      words.length > 0 &&
      activeWordIndex > words.length - 40 &&
      difficulty !== "scripture"
    ) {
      if (ollamaEnabled) fetchOllamaWords();
      else
        setWords((prev) => [
          ...prev,
          ...generateWords(40, tpm, difficulty, tScore >= flowMilestone + 5),
        ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWordIndex, words.length, ollamaEnabled, tpm, difficulty, appPhase]);

  useEffect(() => {
    if (
      activeWordRef.current &&
      containerRef.current &&
      appPhase === "playing"
    ) {
      const top = activeWordRef.current.offsetTop;
      const firstChild = containerRef.current.firstChild;
      if (firstChild) {
        const relativeTop = top - firstChild.offsetTop;
        const actualRowHeight = activeWordRef.current.offsetHeight + 24;

        const focusLineIndex = 1;
        if (relativeTop > actualRowHeight * focusLineIndex) {
          setScrollOffset(-(relativeTop - actualRowHeight * focusLineIndex));
        } else {
          setScrollOffset(0);
        }
      }
    }
  }, [activeWordIndex, words, appPhase]);

  // --- EVENT HANDLERS ---
  const handleInputChange = (e) => {
    const value = e.target.value;
    lastKeystrokeRef.current = Date.now();
    if (status === "idle" || status === "paused") setStatus("typing");
    const currentObj = words[activeWordIndex];
    const targetWord = currentObj.text;
    const isAddition = value.length > currentInput.length;
    if (isAddition) setTotalChars((prev) => prev + 1);

    if (value.endsWith(" ")) {
      const typedWord = value.trim();
      const isCorrect = typedWord === targetWord;

      if (isCorrect) {
        if (currentObj.type === "transformer") {
          setTScore((prev) => prev + 1);
        }

        if (soundEnabled) {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          const isSpecial = currentObj.type === "transformer" || tpm >= 140;
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
        advanceBibleChapter();
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

      setKeyStats((prev) => {
        const stat = prev[expectedChar] || { hits: 0, misses: 0 };
        if (isCharCorrect) stat.hits++;
        else stat.misses++;
        return { ...prev, [expectedChar]: stat };
      });
    }
  };

  // --- COMPUTE ACTIVE FINGERS ---
  const activeFingers = useMemo(() => {
    if (
      !words[activeWordIndex] ||
      status === "paused" ||
      showSettings ||
      showAnalytics ||
      appPhase !== "playing"
    )
      return [];

    // Skip guide hands for verse numbers
    if (words[activeWordIndex].type === "verse-num") return [];

    const targetWord = words[activeWordIndex].text;
    const targetChar =
      currentInput.length < targetWord.length
        ? targetWord[currentInput.length]
        : " ";

    let fingers = [];
    let primaryHand = null;

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
  }, [
    words,
    activeWordIndex,
    currentInput,
    status,
    showSettings,
    showAnalytics,
    appPhase,
  ]);

  // --- DYNAMIC CHART DOWNSAMPLING ---
  let chartData = [...historyRef.current];
  const maxColumns = 60;
  if (chartData.length > maxColumns) {
    const bucketSize = chartData.length / maxColumns;
    const downsampled = [];
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

  // --- RENDER HELPERS ---
  const renderWord = (wordObj, index) => {
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

  const canvasHeight = visibleLines * 60 + 10;

  const CSSFinger = ({ active, h, rotate = "" }) => (
    <div
      className={`w-3.5 sm:w-5 rounded-full transition-all duration-150 ${h} ${rotate} ${active ? `${activeTheme.bg} ${activeTheme.glow} opacity-100 scale-105` : "bg-slate-800/30 opacity-60"}`}
    />
  );

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
          0% { text-shadow: 0 0 20px ${glowColor}; color: ${themeColor}; }
          100% { text-shadow: 0 0 5px rgba(100,116,139,0.2); color: #64748b; }
        }
        .animate-pop-glow { animation: pop-glow 0.4s ease-out forwards; }
      `}</style>

      {/* ULTRA-CLEAN FLOATING DYNAMIC ISLAND */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-max max-w-[95vw]">
        <div className="flex items-center gap-3 sm:gap-6 bg-[#090e17]/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-800 shadow-2xl text-xs tracking-widest text-slate-500 transition-all duration-300">
          <div
            className={`flex items-center gap-2 font-bold transition-all duration-500 cursor-pointer hover:opacity-80 active:scale-95 ${activeTheme.text}`}
            onClick={(e) => {
              e.stopPropagation();
              setResetTrigger((prev) => prev + 1);
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

            {showSettings && (
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
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setOllamaEnabled(true);
                    }}
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
                    onChange={(e) => {
                      const newDiff = e.target.value;
                      setDifficulty(newDiff);
                      if (newDiff === "scripture") {
                        setAppPhase("topic-select");
                        setWords([]);
                        setStatus("idle");
                      } else if (difficulty === "scripture" && newDiff !== "scripture") {
                        // Switching away from scripture, go back to normal flow
                        if (ollamaEnabled) {
                          setAppPhase("topic-select");
                          setWords([]);
                          setStatus("idle");
                          fetchTopicsFromOllama(selectedModel);
                        } else {
                          startSessionOffline(newDiff);
                        }
                      }
                    }}
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
                    <span className="text-slate-600 font-normal">Alt+↑/↓</span>
                  </label>
                  <select
                    value={visibleLines}
                    onChange={(e) => {
                      setVisibleLines(Number(e.target.value));
                      setScrollOffset(0);
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
                    onClick={() => setShowHands(!showHands)}
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
                    onClick={() => {
                      const newState = !ollamaEnabled;
                      setOllamaEnabled(newState);
                      if (!newState && appPhase === "topic-select") {
                        startSessionOffline(difficulty);
                      } else if (newState && appPhase === "playing") {
                        setAppPhase("topic-select");
                        setWords([]);
                      }
                    }}
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
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-2 py-1 text-xs font-bold rounded transition-all ${soundEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
                  >
                    {soundEnabled ? "ON" : "MUTED"}
                  </button>
                </div>

                <hr className="border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setShowSettings(false);
                    if (difficulty === "scripture") {
                      setAppPhase("topic-select");
                      setWords([]);
                      setStatus("idle");
                      setScholarInsight("");
                    } else if (ollamaEnabled) {
                      fetchTopicsFromOllama(selectedModel);
                      setAppPhase("topic-select");
                      setWords([]);
                      setStatus("idle");
                    } else {
                      startSessionOffline(difficulty);
                    }
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded text-xs font-bold uppercase flex justify-center items-center gap-2"
                  title="Alt+R"
                >
                  <RefreshCw className="w-4 h-4" /> Restart Session
                </button>
              </div>
            )}
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

      {/* --- APP PHASE: TOPIC SELECTION --- */}
      {appPhase === "topic-select" && difficulty === "scripture" && (
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
                    if (e.key === "Enter") parseBibleSearch();
                  }}
                  placeholder="e.g. Genesis 1, John 3, Romans 8"
                  className="w-full bg-[#0a0f18] border-2 border-slate-700/50 text-slate-200 font-bold text-xl p-5 pl-14 rounded-2xl outline-none focus:border-cyan-500 focus:bg-[#0d1421] transition-all shadow-inner placeholder:font-normal placeholder:text-slate-600"
                  autoFocus
                />
                <button
                  onClick={parseBibleSearch}
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
                onClick={() => loadBibleChapter(bibleProgress.bookIdx, bibleProgress.chapter)}
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
                      onClick={() => bIdx !== -1 && loadBibleChapter(bIdx, p.chap)}
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
      )}

      {/* --- APP PHASE: TOPIC SELECTION (NEURAL UPLINK) --- */}
      {appPhase === "topic-select" && difficulty !== "scripture" && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-[#060a11]/95 backdrop-blur-md px-8 pt-20">
          <div className="max-w-3xl w-full flex flex-col gap-8 animate-in fade-in zoom-in duration-500 ease-out">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 tracking-tight">
                Initialize Neural Thread
              </h1>
              <p className="text-slate-400 text-lg sm:text-xl font-medium">
                What do you want to learn about today?
              </p>
            </div>

            {/* Custom Topic Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customTopicInput.trim().length > 0) {
                    startSessionWithTopic(customTopicInput.trim());
                  }
                }}
                placeholder="Enter a custom topic and press Enter..."
                className="w-full bg-[#0a0f18] border-2 border-slate-700/50 text-slate-200 font-bold text-xl p-5 pl-14 rounded-2xl outline-none focus:border-cyan-500 focus:bg-[#0d1421] transition-all shadow-inner placeholder:font-normal placeholder:text-slate-600"
                autoFocus
              />
              <button
                onClick={() => {
                  if (customTopicInput.trim().length > 0)
                    startSessionWithTopic(customTopicInput.trim());
                }}
                className="absolute inset-y-2 right-2 bg-cyan-500 hover:bg-cyan-400 text-[#060a11] px-6 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                disabled={customTopicInput.trim().length === 0}
              >
                Start <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* ZenoType 0.7 Dynamic AI Suggestions */}
            <div className="flex flex-col gap-3 min-h-[120px]">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
                Or select a curated topic:
              </span>

              {isGeneratingTopics ? (
                <div className="flex flex-col items-center justify-center py-6 opacity-60 animate-pulse">
                  <BrainCircuit className="w-8 h-8 mb-3 text-cyan-400 animate-spin" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    Synthesizing new topics...
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {dynamicSuggestions.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => startSessionWithTopic(topic)}
                      className="bg-slate-800/50 hover:bg-fuchsia-500/20 text-slate-300 hover:text-fuchsia-400 border border-slate-700/50 hover:border-fuchsia-500/50 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ANALYTICS OVERLAY */}
      {showAnalytics && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060a11]/90 backdrop-blur-sm p-4 sm:p-8"
          onClick={() => {
            setShowAnalytics(false);
            setTimeout(() => inputRef.current?.focus(), 10);
          }}
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
                onClick={() => {
                  setShowAnalytics(false);
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}
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
                      setKeyStats({});
                      setHighScore(0);
                      try {
                        localStorage.removeItem("zenotype_keystats");
                        localStorage.removeItem("zenotype_tpm_high");
                      } catch {}
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
      )}

      {/* --- APP PHASE: PLAYING (MAIN GAME CANVAS) --- */}
      {appPhase === "playing" && (
        <main className="w-full max-w-5xl relative px-8 mt-6">
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
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
                {words.map((w, i) => renderWord(w, i))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* DYNAMIC GUIDE HANDS */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-16 sm:gap-24 z-30 transition-opacity duration-500 pointer-events-none ${showHands && !showSettings && !showAnalytics && status !== "paused" && appPhase === "playing" && words.length > 0 ? "opacity-100" : "opacity-0"}`}
      >
        {/* Left Hand */}
        <div className="flex items-end gap-1.5 sm:gap-2">
          <CSSFinger
            active={activeFingers.includes("l-pinky")}
            h="h-10 sm:h-14"
          />
          <CSSFinger
            active={activeFingers.includes("l-ring")}
            h="h-14 sm:h-20"
          />
          <CSSFinger
            active={activeFingers.includes("l-middle")}
            h="h-16 sm:h-24"
          />
          <CSSFinger
            active={activeFingers.includes("l-index")}
            h="h-14 sm:h-20"
          />
          <div className="ml-2 sm:ml-4 pb-2">
            <CSSFinger
              active={activeFingers.includes("thumbs")}
              h="h-8 sm:h-12"
              rotate="-rotate-[35deg] origin-bottom-left"
            />
          </div>
        </div>

        {/* Right Hand */}
        <div className="flex items-end gap-1.5 sm:gap-2">
          <div className="mr-2 sm:mr-4 pb-2">
            <CSSFinger
              active={activeFingers.includes("thumbs")}
              h="h-8 sm:h-12"
              rotate="rotate-[35deg] origin-bottom-right"
            />
          </div>
          <CSSFinger
            active={activeFingers.includes("r-index")}
            h="h-14 sm:h-20"
          />
          <CSSFinger
            active={activeFingers.includes("r-middle")}
            h="h-16 sm:h-24"
          />
          <CSSFinger
            active={activeFingers.includes("r-ring")}
            h="h-14 sm:h-20"
          />
          <CSSFinger
            active={activeFingers.includes("r-pinky")}
            h="h-10 sm:h-14"
          />
        </div>
      </div>
    </div>
  );
}
