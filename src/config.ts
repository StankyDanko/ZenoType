const OLLAMA_ENDPOINTS = {
  local: 'http://localhost:11434',
  remote: 'https://zenotype-api.southernsky.cloud',
} as const;

export const OLLAMA_BASE_URL: string =
  import.meta.env.VITE_OLLAMA_URL || OLLAMA_ENDPOINTS.remote;
