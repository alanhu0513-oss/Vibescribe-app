import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  X, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Sparkles, 
  Edit3, 
  Hash, 
  Check, 
  FileText,
  Layers
} from 'lucide-react';
import { Platform } from '../types';

export interface DraftHistoryItem {
  id: string;
  timestamp: string;
  source: 'ai_generation' | 'manual_edit' | 'hashtag_added' | 'preset_loaded';
  label: string;
  content: string;
  platform: Platform;
  charCount: number;
}

interface DraftHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: DraftHistoryItem[];
  onRevert: (item: DraftHistoryItem) => void;
  onClearHistory: () => void;
  currentContent: string;
}

export const DraftHistoryDrawer: React.FC<DraftHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onRevert,
  onClearHistory,
  currentContent,
}) => {
  const getSourceIcon = (source: DraftHistoryItem['source']) => {
    switch (source) {
      case 'ai_generation':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'hashtag_added':
        return <Hash className="w-3.5 h-3.5 text-pink-400" />;
      case 'preset_loaded':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Edit3 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/75 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-zinc-950/95 border-l border-white/[0.08] backdrop-blur-2xl shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-800/80 border border-white/10 text-cyan-400">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Draft Version History</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-white/[0.08]">
                        {history.length} snapshots
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Auto-saved revisions during AI generation & edits.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {history.length > 0 && (
                    <button
                      onClick={onClearHistory}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Clear history snapshots"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {history.length === 0 ? (
                  <div className="my-auto py-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-center text-zinc-500 mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-zinc-300">No revisions captured yet</p>
                    <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
                      Snapshots will appear automatically whenever you run the AI generator, append hashtags, or edit your draft.
                    </p>
                  </div>
                ) : (
                  history.map((item, idx) => {
                    const isCurrent = item.content.trim() === currentContent.trim();
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-zinc-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                            : 'bg-zinc-900/40 border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-zinc-950/80 border border-white/[0.08]">
                              {getSourceIcon(item.source)}
                            </span>
                            <span className="font-semibold text-zinc-200 text-xs">
                              {item.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Snippet Preview */}
                        <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-white/[0.04] text-[11px] text-zinc-300 font-sans leading-relaxed line-clamp-3 mb-2.5 whitespace-pre-line">
                          {item.content}
                        </div>

                        {/* Footer details & Action */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <div className="flex items-center gap-2">
                            <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              {item.platform}
                            </span>
                            <span>{item.charCount} chars</span>
                          </div>

                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                              <Check className="w-3 h-3" /> Active Draft
                            </span>
                          ) : (
                            <button
                              onClick={() => onRevert(item)}
                              className="px-2.5 py-1 rounded-lg bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Revert</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 bg-zinc-900/60 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Auto-saved in local session state</span>
                <span className="text-cyan-400">VibeScribe Versioning Engine</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
