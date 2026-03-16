export type Difficulty = 'adaptive' | 'standard' | 'code' | 'syntax' | 'scripture';
export type WordType = 'standard' | 'code' | 'syntax' | 'transformer' | 'ollama' | 'verse-num';
export type AppPhase = 'booting' | 'topic-select' | 'playing';
export type GameStatus = 'idle' | 'typing' | 'paused';

export interface Word {
  type: WordType;
  text: string;
}

export interface KeyStat {
  hits: number;
  misses: number;
}

export interface BibleProgress {
  bookIdx: number;
  chapter: number;
}

export interface CuratedPassage {
  label: string;
  book: string;
  chap: number;
}

export interface ThemeConfig {
  text: string;
  bg: string;
  glow: string;
  rawColor: string;
  rawGlow: string;
}
