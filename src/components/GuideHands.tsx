import React from 'react';
import type { ThemeConfig } from '../types';

interface GuideHandsProps {
  activeFingers: string[];
  activeTheme: ThemeConfig;
  visible: boolean;
}

interface CSSFingerProps {
  active: boolean;
  h: string;
  rotate?: string;
  activeTheme: ThemeConfig;
}

const CSSFinger: React.FC<CSSFingerProps> = ({ active, h, rotate = "", activeTheme }) => (
  <div
    className={`w-3.5 sm:w-5 rounded-full transition-all duration-150 ${h} ${rotate} ${active ? `${activeTheme.bg} ${activeTheme.glow} opacity-100 scale-105` : "bg-slate-800/30 opacity-60"}`}
  />
);

const GuideHands: React.FC<GuideHandsProps> = ({ activeFingers, activeTheme, visible }) => {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-16 sm:gap-24 z-30 transition-opacity duration-500 pointer-events-none ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Left Hand */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        <CSSFinger
          active={activeFingers.includes("l-pinky")}
          h="h-10 sm:h-14"
          activeTheme={activeTheme}
        />
        <CSSFinger
          active={activeFingers.includes("l-ring")}
          h="h-14 sm:h-20"
          activeTheme={activeTheme}
        />
        <CSSFinger
          active={activeFingers.includes("l-middle")}
          h="h-16 sm:h-24"
          activeTheme={activeTheme}
        />
        <CSSFinger
          active={activeFingers.includes("l-index")}
          h="h-14 sm:h-20"
          activeTheme={activeTheme}
        />
        <div className="ml-2 sm:ml-4 pb-2">
          <CSSFinger
            active={activeFingers.includes("thumbs")}
            h="h-8 sm:h-12"
            rotate="-rotate-[35deg] origin-bottom-left"
            activeTheme={activeTheme}
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
            activeTheme={activeTheme}
          />
        </div>
        <CSSFinger
          active={activeFingers.includes("r-index")}
          h="h-14 sm:h-20"
          activeTheme={activeTheme}
        />
        <CSSFinger
          active={activeFingers.includes("r-middle")}
          h="h-16 sm:h-24"
          activeTheme={activeTheme}
        />
        <CSSFinger
          active={activeFingers.includes("r-ring")}
          h="h-14 sm:h-20"
          activeTheme={activeTheme}
        />
        <CSSFinger
          active={activeFingers.includes("r-pinky")}
          h="h-10 sm:h-14"
          activeTheme={activeTheme}
        />
      </div>
    </div>
  );
};

export default GuideHands;
