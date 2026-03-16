import type { ThemeConfig } from '../types';

export const getThemeForTPM = (tpm: number): ThemeConfig => {
  if (tpm >= 140) {
    return {
      text: "text-fuchsia-400 font-black animate-pulse",
      bg: "bg-fuchsia-400",
      glow: "shadow-[0_0_15px_rgba(232,121,249,0.8)]",
      rawColor: "#e879f9",
      rawGlow: "rgba(232,121,249,1)",
    };
  } else if (tpm >= 130) {
    return {
      text: "text-rose-400",
      bg: "bg-rose-400",
      glow: "shadow-[0_0_12px_rgba(251,113,133,0.6)]",
      rawColor: "#fb7185",
      rawGlow: "rgba(251,113,133,1)",
    };
  } else if (tpm >= 120) {
    return {
      text: "text-orange-400",
      bg: "bg-orange-400",
      glow: "shadow-[0_0_12px_rgba(251,146,60,0.6)]",
      rawColor: "#fb923c",
      rawGlow: "rgba(251,146,60,1)",
    };
  } else if (tpm >= 110) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-400",
      glow: "shadow-[0_0_12px_rgba(251,191,36,0.6)]",
      rawColor: "#fbbf24",
      rawGlow: "rgba(251,191,36,1)",
    };
  } else if (tpm >= 100) {
    return {
      text: "text-yellow-400",
      bg: "bg-yellow-400",
      glow: "shadow-[0_0_12px_rgba(250,204,21,0.6)]",
      rawColor: "#facc15",
      rawGlow: "rgba(250,204,21,1)",
    };
  } else if (tpm >= 90) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-400",
      glow: "shadow-[0_0_12px_rgba(52,211,153,0.6)]",
      rawColor: "#34d399",
      rawGlow: "rgba(52,211,153,1)",
    };
  } else if (tpm >= 80) {
    return {
      text: "text-green-400",
      bg: "bg-green-400",
      glow: "shadow-[0_0_12px_rgba(74,222,128,0.6)]",
      rawColor: "#4ade80",
      rawGlow: "rgba(74,222,128,1)",
    };
  } else {
    return {
      text: "text-cyan-400",
      bg: "bg-cyan-400",
      glow: "shadow-[0_0_12px_rgba(34,211,238,0.6)]",
      rawColor: "#22d3ee",
      rawGlow: "rgba(34,211,238,1)",
    };
  }
};
