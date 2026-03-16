import { useEffect, useRef } from 'react';

interface HotkeyCallbacks {
  onToggleAnalytics: () => void;
  onToggleSettings: () => void;
  onToggleHands: () => void;
  onReset: () => void;
  onVisibleLinesUp: () => void;
  onVisibleLinesDown: () => void;
  getAppPhase: () => string;
}

export function useHotkeys(callbacks: HotkeyCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const cb = callbacksRef.current;
      if (e.key === 'Enter' && cb.getAppPhase() === 'playing') {
        e.preventDefault();
        cb.onToggleAnalytics();
      }
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'o') { e.preventDefault(); cb.onToggleSettings(); }
        else if (key === 's') { e.preventDefault(); cb.onToggleAnalytics(); }
        else if (key === 'h') { e.preventDefault(); cb.onToggleHands(); }
        else if (key === 'r') { e.preventDefault(); cb.onReset(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); cb.onVisibleLinesDown(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); cb.onVisibleLinesUp(); }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
}
