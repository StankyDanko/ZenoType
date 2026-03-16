import type { Difficulty, Word, WordType } from '../types';

export const SENTENCES_STANDARD: string[] = [
  "The rapid advancement of artificial intelligence is transforming how we interact with technology daily.",
  "Cloud computing allows developers to deploy scalable applications without managing physical hardware servers.",
  "A well-designed database architecture ensures fast query performance and reliable data integrity.",
  "User experience design focuses on creating intuitive interfaces that delight and guide the customer.",
  "Machine learning models require vast amounts of clean training data to reduce bias and improve accuracy.",
];

export const SENTENCES_CODE: string[] = [
  "When using React, the useEffect hook is essential for managing side effects and fetching async data.",
  "The initializeApp() function must be called before trying to access the firestoreDb instance.",
  "We defined a userProfile object to store the payload returned by the authenticateUser() method.",
  "Make sure to wrap your await calls inside a tryCatch block to gracefully handle api_errors.",
  "The map() function creates a new array populated with the results of calling a provided function.",
];

export const SENTENCES_SYNTAX: string[] = [
  "function init(opts = { debug: false }) { return Object.keys(opts).length > 0; }",
  "const calculate_entropy = (p) => -p * Math.log2(p) - (1-p) * Math.log2(1-p);",
  "if (res.status === 200 && res.data !== null) { yield* parse_stream(res.data); }",
  "export const Module = <T extends Node>(element: T): void => { element.mount(); };",
  "regex.match(/^[a-zA-Z0-9]+$/) ? true : throw new Error('Invalid Syntax');",
];

export const HALLUCINATIONS: string[] = [
  "blorpaglorp",
  "snargle",
  "fizzbang",
  "glipglop",
  "zizzbot",
];

export const FALLBACK_TOPIC_POOL: string[] = [
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

export const getRandomFallbackTopics = (count = 8): string[] => {
  const shuffled = [...FALLBACK_TOPIC_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateWords = (
  count = 60,
  tpm = 0,
  difficulty: Difficulty = "adaptive",
  forceFlow = false,
): Word[] => {
  let wordPool: Word[] = [];
  while (wordPool.length < count) {
    let wordType: WordType = "standard";
    if (difficulty === "adaptive") {
      wordType = tpm > 100 ? "syntax" : tpm > 60 ? "code" : "standard";
    } else if (difficulty === "standard" || difficulty === "code" || difficulty === "syntax") {
      wordType = difficulty;
    }

    let sentence = "";
    if (forceFlow) {
      sentence =
        "finding your rhythm is the key to achieving a true zen state of mind where your fingers simply fly across the keyboard";
    } else if (wordType === "syntax") {
      sentence =
        SENTENCES_SYNTAX[Math.floor(Math.random() * SENTENCES_SYNTAX.length)];
    } else if (wordType === "code") {
      sentence =
        SENTENCES_CODE[Math.floor(Math.random() * SENTENCES_CODE.length)];
    } else {
      sentence =
        SENTENCES_STANDARD[
          Math.floor(Math.random() * SENTENCES_STANDARD.length)
        ];
    }

    const sentenceWords: Word[] = sentence.split(" ").map((w) => {
      const isTransformer = Math.random() < 0.05;
      return { type: isTransformer ? "transformer" : wordType, text: w };
    });

    wordPool = [...wordPool, ...sentenceWords];
  }
  return wordPool.slice(0, count);
};
