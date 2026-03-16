import { useState, useCallback } from 'react';
import type { Word, BibleProgress } from '../types';
import { OLLAMA_BASE_URL } from '../config';
import { BIBLE_BOOKS, CHAPTER_COUNTS } from '../constants/bible';

interface UseScriptureProps {
  ollamaEnabled: boolean;
  selectedModel: string;
  onWordsLoaded: (words: Word[]) => void;
  onResetGameState: () => void;
  onSetAppPhase: (phase: string) => void;
}

export function useScripture({
  ollamaEnabled,
  selectedModel,
  onWordsLoaded,
  onResetGameState,
  onSetAppPhase,
}: UseScriptureProps) {
  const [bibleProgress, setBibleProgress] = useState<BibleProgress>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zenotype_bible_progress") as string);
      if (saved && typeof saved.bookIdx === 'number') return saved;
      return { bookIdx: 0, chapter: 1 };
    } catch {
      return { bookIdx: 0, chapter: 1 };
    }
  });
  const [scholarInsight, setScholarInsight] = useState('');
  const [isFetchingScholar, setIsFetchingScholar] = useState(false);
  const [customBibleSearch, setCustomBibleSearch] = useState('');
  const [bibleApiError, setBibleApiError] = useState('');
  const [showVerseNumbers, setShowVerseNumbers] = useState(
    () => localStorage.getItem("zenotype_versenums") !== "false",
  );
  const [bibleVersion, setBibleVersion] = useState(
    () => localStorage.getItem("zenotype_version") || "kjv",
  );

  const fetchScholarInsight = useCallback(async (book: string, chapter: number) => {
    if (!ollamaEnabled) return;
    setIsFetchingScholar(true);
    setScholarInsight('');
    try {
      const promptPayload = `The user is about to type ${book} chapter ${chapter}. Provide a fascinating, deeply scholarly 2-sentence insight into the historical context, original Greek/Hebrew/Aramaic translation nuances, or theological significance of this specific chapter.`;

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: promptPayload,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error('Scholar Offline');
      const data = await response.json();
      setScholarInsight(data.response.replace(/[*_~`#]/g, '').trim());
    } catch (e) {
      console.warn('Scholar AI is offline or unavailable.');
    } finally {
      setIsFetchingScholar(false);
    }
  }, [ollamaEnabled, selectedModel]);

  const loadBibleChapter = useCallback(async (
    bIdx: number,
    cNum: number,
    ver: string = bibleVersion,
    verseNums: boolean = showVerseNumbers,
  ) => {
    onSetAppPhase('playing');
    onResetGameState();
    setBibleApiError('');

    const bookName = BIBLE_BOOKS[bIdx];

    try {
      const res = await fetch(
        `https://bible-api.com/${bookName}+${cNum}?translation=${ver}`,
      );
      if (!res.ok) throw new Error('Failed to fetch Scripture from API.');
      const data = await res.json();

      let newWords: Word[] = [];
      data.verses.forEach((v: { verse: number; text: string }) => {
        if (verseNums) {
          newWords.push({ type: 'verse-num', text: `${v.verse}` });
        }

        const cleanText = v.text
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const verseWords: Word[] = cleanText
          .split(' ')
          .filter((w: string) => w.length > 0)
          .map((w: string) => {
            const isTransformer = Math.random() < 0.05 && w.length > 3;
            return {
              type: isTransformer ? 'transformer' : 'standard',
              text: w,
            } as Word;
          });
        newWords = [...newWords, ...verseWords];
      });

      setBibleProgress({ bookIdx: bIdx, chapter: cNum });
      onWordsLoaded(newWords);

      fetchScholarInsight(bookName, cNum);
    } catch (e) {
      console.error(e);
      setBibleApiError(
        'Unable to connect to Bible API. Please check your internet.',
      );
      onSetAppPhase('topic-select');
    }
  }, [bibleVersion, showVerseNumbers, onResetGameState, onSetAppPhase, onWordsLoaded, fetchScholarInsight]);

  const advanceBibleChapter = useCallback(() => {
    let nextChap = bibleProgress.chapter + 1;
    let nextBookIdx = bibleProgress.bookIdx;

    if (nextChap > CHAPTER_COUNTS[nextBookIdx]) {
      nextChap = 1;
      nextBookIdx++;
    }

    if (nextBookIdx >= BIBLE_BOOKS.length) {
      alert('Incredible. You have typed through the entire Bible.');
      return;
    }

    loadBibleChapter(nextBookIdx, nextChap);
  }, [bibleProgress, loadBibleChapter]);

  const parseBibleSearch = useCallback(() => {
    const str = customBibleSearch.trim().toLowerCase();
    if (!str) return;

    let targetBookIdx = -1;
    let targetChapter = 1;

    for (let i = 0; i < BIBLE_BOOKS.length; i++) {
      if (str.startsWith(BIBLE_BOOKS[i].toLowerCase())) {
        targetBookIdx = i;
        const remainder = str.replace(BIBLE_BOOKS[i].toLowerCase(), '').trim();
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
  }, [customBibleSearch, loadBibleChapter]);

  const persistScripture = useCallback(() => {
    try {
      localStorage.setItem("zenotype_versenums", showVerseNumbers.toString());
      localStorage.setItem("zenotype_version", bibleVersion);
      localStorage.setItem("zenotype_bible_progress", JSON.stringify(bibleProgress));
    } catch {}
  }, [showVerseNumbers, bibleVersion, bibleProgress]);

  return {
    bibleProgress,
    setBibleProgress,
    scholarInsight,
    setScholarInsight,
    isFetchingScholar,
    customBibleSearch,
    setCustomBibleSearch,
    bibleApiError,
    setBibleApiError,
    showVerseNumbers,
    setShowVerseNumbers,
    bibleVersion,
    setBibleVersion,
    loadBibleChapter,
    advanceBibleChapter,
    parseBibleSearch,
    fetchScholarInsight,
    persistScripture,
  };
}
