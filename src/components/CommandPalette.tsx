import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  BarChart3, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Sparkles, 
  Hash, 
  History, 
  PlusCircle, 
  X, 
  CornerDownLeft, 
  Check, 
  Layers
} from 'lucide-react';
import { Platform } from '../types';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Navigation' | 'Actions' | 'Social Channels' | 'Security & Settings';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: 'workspace' | 'analytics') => void;
  onOpenSecurity: () => void;
  onOpenSubscription: () => void;
  onOpenAuth: () => void;
  onSelectPlatform: (platform: Platform) => void;
  onNewPost: () => void;
  onTriggerGenerate: () => void;
  onTriggerHashtags: () => void;
  onOpenDraftHistory: () => void;
  onDownloadReport: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onOpenSecurity,
  onOpenSubscription,
  onOpenAuth,
  onSelectPlatform,
  onNewPost,
  onTriggerGenerate,
  onTriggerHashtags,
  onOpenDraftHistory,
  onDownloadReport,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Define commands list
  const commands: CommandItem[] = [
    {
      id: 'cmd-workspace',
      title: 'Studio Workspace',
      description: 'Switch to the AI prompt studio and multi-channel draft composer',
      category: 'Navigation',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G W',
      action: () => {
        onSelectView('workspace');
        onClose();
      }
    },
    {
      id: 'cmd-analytics',
      title: 'Analytics & D3 Telemetry',
      description: 'View real-time dispatch health, high-engagement heatmap & KPIs',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
      shortcut: 'G A',
      action: () => {
        onSelectView('analytics');
        onClose();
      }
    },
    {
      id: 'cmd-new-post',
      title: 'New Post (Clear Editor)',
      description: 'Reset canvas for a clean new social dispatch payload',
      category: 'Actions',
      icon: <PlusCircle className="w-4 h-4 text-zinc-300" />,
      shortcut: 'N',
      action: () => {
        onSelectView('workspace');
        onNewPost();
        onClose();
      }
    },
    {
      id: 'cmd-gen-ai',
      title: 'Run AI Post Generator',
      description: 'Generate structured thought leadership with Gemini & framer-motion',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      shortcut: '⌘ ↵',
      action: () => {
        onSelectView('workspace');
        onTriggerGenerate();
        onClose();
      }
    },
    {
      id: 'cmd-hashtags',
      title: 'Generate Trending Hashtags',
      description: 'Query Gemini 3.8 Flash for platform-tailored viral hashtag matrix',
      category: 'Actions',
      icon: <Hash className="w-4 h-4 text-pink-400" />,
      shortcut: '#',
      action: () => {
        onSelectView('workspace');
        onTriggerHashtags();
        onClose();
      }
    },
    {
      id: 'cmd-draft-history',
      title: 'Open Draft History Drawer',
      description: 'Browse autosaved versions and revert previous copy changes',
      category: 'Actions',
      icon: <History className="w-4 h-4 text-cyan-400" />,
      shortcut: 'H',
      action: () => {
        onSelectView('workspace');
        onOpenDraftHistory();
        onClose();
      }
    },
    {
      id: 'cmd-download-pdf',
      title: 'Download PDF Analytics Report',
      description: 'Generate and trigger immediate PDF performance audit report',
      category: 'Actions',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      shortcut: 'P',
      action: () => {
        onDownloadReport();
        onClose();
      }
    },
    {
      id: 'cmd-platform-linkedin',
      title: 'Switch Target Channel: LinkedIn',
      description: 'Executive tone, thought leadership formatting & 3,000 char capacity',
      category: 'Social Channels',
      icon: <i className="fa-brands fa-linkedin text-[#0077b5] text-sm" />,
      shortcut: '1',
      action: () => {
        onSelectView('workspace');
        onSelectPlatform('linkedin');
        onClose();
      }
    },
    {
      id: 'cmd-platform-twitter',
      title: 'Switch Target Channel: Twitter / X',
      description: 'Punchy brevity, 280 char enforcement & viral hooks',
      category: 'Social Channels',
      icon: <i className="fa-brands fa-x-twitter text-white text-sm" />,
      shortcut: '2',
      action: () => {
        onSelectView('workspace');
        onSelectPlatform('twitter');
        onClose();
      }
    },
    {
      id: 'cmd-platform-instagram',
      title: 'Switch Target Channel: Instagram',
      description: 'Visual caption format with automated hashtag spacing & 2,200 char capacity',
      category: 'Social Channels',
      icon: <i className="fa-brands fa-instagram text-pink-400 text-sm" />,
      shortcut: '3',
      action: () => {
        onSelectView('workspace');
        onSelectPlatform('instagram');
        onClose();
      }
    },
    {
      id: 'cmd-security',
      title: 'Security & 2FA Tokens Hub',
      description: 'Review SHA-256 cryptographic keys, active tokens & multi-factor auth',
      category: 'Security & Settings',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onOpenSecurity();
        onClose();
      }
    },
    {
      id: 'cmd-subscription',
      title: 'Subscription & Quota Plans',
      description: 'Switch plans between Free, Pro ($29/mo) and Enterprise quotas',
      category: 'Security & Settings',
      icon: <CreditCard className="w-4 h-4 text-purple-400" />,
      action: () => {
        onOpenSubscription();
        onClose();
      }
    }
  ];

  // Filter commands by query
  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
      {/* Dark frosted Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Palette Card */}
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-zinc-900/95 border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-zinc-950/50">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, navigate views, or trigger actions..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10 shrink-0">
            ESC
          </span>
        </div>

        {/* Command List */}
        <div className="overflow-y-auto p-2 divide-y divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 font-mono">
              No matching commands found for "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-zinc-800/90 text-white shadow-inner border border-white/10' 
                      : 'text-zinc-300 hover:bg-zinc-850/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-zinc-700/60 text-white' : 'bg-zinc-950/60 text-zinc-400'}`}>
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tracking-tight text-zinc-100 truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-950/60 text-zinc-400 border border-white/[0.05]">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-400 border border-white/[0.08]">
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-zinc-950/70 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300">↑</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300">↵</kbd> to select</span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> VibeScribe Palette
          </span>
        </div>
      </div>
    </div>
  );
};
