import { useState, useRef, useEffect, useCallback } from 'react';
import type { Word, Difficulty, KeyStat } from '../types';
import { OLLAMA_BASE_URL } from '../config';
import { getRandomFallbackTopics, generateWords } from '../constants/sentences';

interface UseOllamaProps {
  onWordsGenerated: (words: Word[], isReset: boolean) => void;
  onBootFailed: (difficulty: Difficulty) => void;
  onBootSuccess: (initialModel: string) => void;
}

interface FetchWordsParams {
  aggregatedKeyStats: Record<string, KeyStat>;
  tpm: number;
  difficulty: Difficulty;
  tScore: number;
}

export function useOllama({ onWordsGenerated, onBootFailed, onBootSuccess }: UseOllamaProps) {
  const [ollamaEnabled, setOllamaEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [ollamaError, setOllamaError] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('zenotype:latest');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [activeThread, setActiveThread] = useState('');
  const [flowMilestone, setFlowMilestone] = useState(0);

  const generateAbortControllerRef = useRef<AbortController | null>(null);
  const topicAbortControllerRef = useRef<AbortController | null>(null);
  const threadHistoryRef = useRef('');

  // --- DYNAMIC TOPIC GENERATOR ---
  const fetchTopicsFromOllama = useCallback(async (modelName: string) => {
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

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: promptPayload,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Ollama Offline');
      const data = await response.json();

      const parsedTopics = data.response
        .split(',')
        .map((t: string) =>
          t
            .trim()
            .replace(/['"]/g, '')
            .replace(/^[*-]\s*/, '')
            .replace(/_/g, ' '),
        ) // Violently rip out underscores
        .filter((t: string) => t.length > 0 && t.length < 50)
        .slice(0, 8);

      if (parsedTopics.length >= 4) {
        setDynamicSuggestions(parsedTopics);
      } else {
        throw new Error('Sanitization failed to produce enough topics');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.warn(
        'Topic Generation Error. Using fallback curated pool.',
        error,
      );
      setDynamicSuggestions(getRandomFallbackTopics(8));
    } finally {
      if (topicAbortControllerRef.current === controller) {
        setIsGeneratingTopics(false);
      }
    }
  }, []);

  // --- SMART OLLAMA EDUCATOR ENGINE ---
  const fetchOllamaWords = useCallback(async (
    params: FetchWordsParams,
    isReset = false,
    modelOverride?: string,
    specificThread?: string,
  ) => {
    const model = modelOverride ?? selectedModel;
    const thread = specificThread ?? activeThread;
    const { aggregatedKeyStats, tpm, difficulty, tScore: currentTScore } = params;

    if (isGenerating && !isReset) return;
    if (!ollamaEnabled && !isReset) return;

    if (isReset && generateAbortControllerRef.current) {
      generateAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    generateAbortControllerRef.current = controller;

    setIsGenerating(true);
    setOllamaError('');

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

      const isFlowState = currentTScore >= flowMilestone + 5;
      if (isFlowState) setFlowMilestone((prev) => prev + 5);

      const tone =
        tpm > 120
          ? 'urgent, fast-paced, and highly technical'
          : tpm > 70
            ? 'informative and analytical'
            : 'calm, methodical, and accessible';

      let contextModifier =
        'Write standard, engaging, grammatical English prose.';
      if (
        difficulty === 'code' ||
        (difficulty === 'adaptive' && tpm > 60 && tpm <= 100)
      ) {
        contextModifier =
          'Write standard English prose, but substitute key concepts and nouns with camelCaseVariables and snake_case_terms.';
      } else if (
        difficulty === 'syntax' ||
        (difficulty === 'adaptive' && tpm > 100)
      ) {
        contextModifier =
          'Write flowing English prose, but aggressively pepper the sentences with programming symbols like {}, [], (), &&, ||, and ===. Substitute some nouns with camelCase.';
      }

      let promptPayload = isFlowState
        ? `Write a highly rhythmic, calming, and flowing paragraph (3 to 4 sentences) about ${thread}.
          CRITICAL RULES:
          1. MUST be entirely lowercase.
          2. MUST NOT contain ANY punctuation or numbers.
          3. DO NOT output conversational filler like 'Here is the paragraph'.
          4. Output ONLY the raw text to give the user a smooth speed boost.
          Seed: ${seed}`
        : `${threadHistoryRef.current ? `CONTINUE the educational narrative about ${thread} seamlessly. Context to continue from: "...${threadHistoryRef.current}"` : `You are an expert educator. Write a fascinating paragraph (3 to 4 sentences) teaching the user about ${thread}.`}

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
        promptPayload += `\n6. Naturally incorporate words that contain these specific characters to help the user practice their weak points: ${worstKeys.join(', ')}`;
      }

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: promptPayload,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Ollama Offline');
      const data = await response.json();

      let cleanText = data.response
        .replace(/<\|.*?\|>/g, '')
        .replace(/[*_`#]/g, '')
        .replace(
          /(here is|here are|sure|certainly|generated paragraph|typing buffer).*?\n/gi,
          '',
        )
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[^\x20-\x7E\n]/g, '')
        .trim();

      const parsedWords: Word[] = cleanText
        .split(/\s+/)
        .filter((w: string) => w.length > 0)
        .slice(0, 50)
        .map((w: string) => {
          const isTransformer = Math.random() < 0.05;
          return { type: isTransformer ? 'transformer' : 'ollama', text: w } as Word;
        });

      if (parsedWords.length === 0)
        throw new Error('Sanitization empty response');

      // Expanded memory slice to 15 words to prevent logical drift
      const lastWords = parsedWords
        .slice(-15)
        .map((w) => w.text)
        .join(' ');
      threadHistoryRef.current = lastWords;

      onWordsGenerated(parsedWords, isReset);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error(error);
      setOllamaError('Generation Error. Falling back.');

      const isFlowState = currentTScore >= flowMilestone + 5;
      if (isFlowState) setFlowMilestone((prev) => prev + 5);

      if (isReset) {
        onWordsGenerated(generateWords(60, tpm, difficulty, isFlowState), true);
      } else {
        onWordsGenerated(generateWords(40, tpm, difficulty, isFlowState), false);
      }
      setTimeout(() => setOllamaError(''), 4000);
    } finally {
      if (generateAbortControllerRef.current === controller) {
        setIsGenerating(false);
      }
    }
  }, [selectedModel, activeThread, isGenerating, ollamaEnabled, flowMilestone, onWordsGenerated]);

  const abortAll = useCallback(() => {
    if (topicAbortControllerRef.current)
      topicAbortControllerRef.current.abort();
    if (generateAbortControllerRef.current)
      generateAbortControllerRef.current.abort();
  }, []);

  // --- AI-FIRST BOOT SEQUENCE ---
  useEffect(() => {
    let mounted = true;
    fetch(`${OLLAMA_BASE_URL}/api/tags`)
      .then((res) => res.json())
      .then((data) => {
        if (data.models && data.models.length > 0 && mounted) {
          const modelNames = data.models.map((m: { name: string }) => m.name);
          setAvailableModels(modelNames);

          let initialModel = modelNames[0];
          if (modelNames.includes('zenotype:latest'))
            initialModel = 'zenotype:latest';
          else if (modelNames.includes('zenotype')) initialModel = 'zenotype';
          else if (modelNames.includes('zentype:latest'))
            initialModel = 'zentype:latest';
          else if (modelNames.includes('llama3.2:3b'))
            initialModel = 'llama3.2:3b';

          setSelectedModel(initialModel);
          setOllamaEnabled(true);
          onBootSuccess(initialModel);
          fetchTopicsFromOllama(initialModel);
        } else {
          throw new Error('No models detected');
        }
      })
      .catch(() => {
        if (mounted) {
          console.warn('Ollama not detected. Defaulting to local buffer.');
          setOllamaEnabled(false);
          onBootFailed('adaptive');
        }
      });
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ollamaEnabled,
    setOllamaEnabled,
    isGenerating,
    setIsGenerating,
    isGeneratingTopics,
    setIsGeneratingTopics,
    ollamaError,
    setOllamaError,
    availableModels,
    setAvailableModels,
    selectedModel,
    setSelectedModel,
    dynamicSuggestions,
    setDynamicSuggestions,
    activeThread,
    setActiveThread,
    flowMilestone,
    setFlowMilestone,
    threadHistoryRef,
    fetchTopicsFromOllama,
    fetchOllamaWords,
    abortAll,
  };
}
