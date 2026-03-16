import React from 'react';
import { Search, ChevronRight, BrainCircuit } from 'lucide-react';

interface TopicSelectProps {
  dynamicSuggestions: string[];
  isGeneratingTopics: boolean;
  customTopicInput: string;
  setCustomTopicInput: (v: string) => void;
  onSelectTopic: (topic: string) => void;
}

const TopicSelect: React.FC<TopicSelectProps> = ({
  dynamicSuggestions,
  isGeneratingTopics,
  customTopicInput,
  setCustomTopicInput,
  onSelectTopic,
}) => {
  return (
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
                onSelectTopic(customTopicInput.trim());
              }
            }}
            placeholder="Enter a custom topic and press Enter..."
            className="w-full bg-[#0a0f18] border-2 border-slate-700/50 text-slate-200 font-bold text-xl p-5 pl-14 rounded-2xl outline-none focus:border-cyan-500 focus:bg-[#0d1421] transition-all shadow-inner placeholder:font-normal placeholder:text-slate-600"
            autoFocus
          />
          <button
            onClick={() => {
              if (customTopicInput.trim().length > 0)
                onSelectTopic(customTopicInput.trim());
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
                  onClick={() => onSelectTopic(topic)}
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
  );
};

export default TopicSelect;
