import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { Platform } from '../types';
import { 
  Sparkles, 
  Send, 
  Clock, 
  Calendar, 
  Hash, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertTriangle, 
  ChevronDown, 
  Terminal,
  Zap,
  CheckCircle2,
  TrendingUp,
  Layers
} from 'lucide-react';

export const PLATFORMS_CONFIG = {
  linkedin: {
    id: 'linkedin' as Platform,
    name: 'LinkedIn',
    charLimit: 3000,
    icon: 'fa-brands fa-linkedin',
    color: '#0a66c2',
    badgeClass: 'bg-[#0a66c2]/10 border-[#0a66c2]/30 text-[#0a66c2]',
    headline: 'Head of Growth • 1st',
    sampleTag: '#StartupGrowth #SaaS #VentureCapital #AIArchitecture'
  },
  twitter: {
    id: 'twitter' as Platform,
    name: 'X / Twitter',
    charLimit: 280,
    icon: 'fa-brands fa-x-twitter',
    color: '#ffffff',
    badgeClass: 'bg-zinc-800 border-zinc-700 text-white',
    headline: '@alexmorgan • Principal Engineer',
    sampleTag: '#buildinpublic #webdev #systems'
  },
  instagram: {
    id: 'instagram' as Platform,
    name: 'Instagram',
    charLimit: 2200,
    icon: 'fa-brands fa-instagram',
    color: '#ec4899',
    badgeClass: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    headline: 'San Francisco, CA',
    sampleTag: '#engineering #architecture #tech #design'
  }
};

interface WorkspaceProps {
  onOpenAuth: () => void;
  onOpenSubscription: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ onOpenAuth, onOpenSubscription, showToast }) => {
  const { user, profile } = useAuth();
  const { schedulePost, posts, sendImmediately, deletePost, updatePostStatus } = usePosts();

  const [activePlatform, setActivePlatform] = useState<Platform>('linkedin');
  const [tone, setTone] = useState('Executive Thought Leadership');
  const [goal, setGoal] = useState('Maximize Organic Discourse');
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState(`Most founders think fundraising validates their business model.\n\nHere’s the uncomfortable truth: Customers paying cash validates it. Everything else is fuel.\n\nBefore raising a single venture dollar:\n• We bootstrapped to $1.2M ARR with just 4 engineers\n• 72% of users arrived strictly via organic word-of-mouth\n• We spent $0 on acquisition ads\n\nDeterministic system architecture beats hype every single quarter. 🚀`);
  
  // Custom scheduling timestamp picker
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date(Date.now() + 1000 * 60 * 15); // 15 mins ahead by default
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genStepText, setGenStepText] = useState('');
  const [copied, setCopied] = useState(false);

  const currentPlatform = PLATFORMS_CONFIG[activePlatform];
  const charCount = draft.length;
  const isOverLimit = charCount > currentPlatform.charLimit;

  // Handle AI generation lifecycle
  const handleGenerate = () => {
    if (isGenerating) return;
    const trimmed = prompt.trim();
    if (trimmed.split(/\s+/).length < 2) {
      showToast('Please enter at least 2 words in the concept prompt for AI contextual grounding.', 'error');
      return;
    }

    setIsGenerating(true);
    setGenStep(1);
    setGenStepText('Syncing context parameters...');

    setTimeout(() => {
      setGenStep(2);
      setGenStepText('Optimizing semantic anchors...');

      setTimeout(() => {
        setGenStep(3);
        setGenStepText('Compiling cross-platform payload...');

        setTimeout(() => {
          let newPost = '';
          const topic = prompt || 'Scaling enterprise content infrastructure with deterministic pipelines';

          if (activePlatform === 'twitter') {
            newPost = `${topic.slice(0, 130)}\n\n• Zero runtime spaghetti\n• 100% immutable state\n• Real-time channel telemetry\n\nShipping > Talking. ⚡️`;
          } else if (activePlatform === 'instagram') {
            newPost = `${topic}\n\nKey Engineering Highlights:\n01 // Sub-800ms latency execution\n02 // Real-time cross-channel auto scheduler\n03 // Verified enterprise security keys\n\nDouble tap if your team ships clean architecture over shortcuts. ⚡️\n\n#TechLeadership #SoftwareEngineering #Architecture #SaaS`;
          } else {
            newPost = `${topic}\n\nHere are 3 core architectural realities we enforced while scaling:\n\n1. Deterministic State Machines Beat Adjectives: When user actions mutate a centralized immutable store, error tracking becomes instantaneous.\n\n2. Real-Time Telemetry Eliminates Guesswork: Direct state-to-canvas mapping provides immediate clarity into channel distribution.\n\n3. Ruthless Design Minimalism: High-contrast monochrome palettes remove visual noise and keep operators focused on high-signal output.\n\nWhat is your team’s golden engineering constraint this quarter?\n\n#EngineeringLeadership #SystemsDesign #SaaS #GrowthOps`;
          }

          setDraft(newPost);
          setIsGenerating(false);
          setGenStep(0);
          showToast(`System package generated for ${currentPlatform.name}.`, 'success');
        }, 500);
      }, 500);
    }, 450);
  };

  const handleScheduleSubmit = async () => {
    if (!draft.trim()) {
      showToast('Cannot schedule an empty post.', 'error');
      return;
    }

    if (!user) {
      onOpenAuth();
      showToast('Please sign in with your account to schedule posts.', 'info');
      return;
    }

    try {
      const scheduledIso = new Date(scheduleDate).toISOString();
      await schedulePost({
        platform: activePlatform,
        body: draft,
        scheduledAt: scheduledIso,
        tone,
        goal
      });
      showToast(`Post scheduled for ${new Date(scheduleDate).toLocaleString()}!`, 'success');
    } catch (err: any) {
      if (err.message?.includes('Monthly post limit')) {
        onOpenSubscription();
      }
      showToast(err.message || 'Failed to schedule post', 'error');
    }
  };

  const handleSendNow = async () => {
    if (!draft.trim()) return;
    if (!user) {
      onOpenAuth();
      showToast('Please sign in to send posts.', 'info');
      return;
    }

    try {
      // Schedule for right now, then trigger immediate send
      const scheduledIso = new Date().toISOString();
      const newId = await schedulePost({
        platform: activePlatform,
        body: draft,
        scheduledAt: scheduledIso,
        tone,
        goal
      });
      await sendImmediately(newId);
      showToast(`Dispatched immediately to ${currentPlatform.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Dispatch failed', 'error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    showToast('Post copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const insertHashtags = () => {
    setPrompt(prev => (prev ? `${prev} ${currentPlatform.sampleTag}` : currentPlatform.sampleTag));
  };

  const trimToLimit = () => {
    setDraft(prev => prev.slice(0, currentPlatform.charLimit));
    showToast(`Draft trimmed to ${currentPlatform.charLimit} characters.`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-zinc-800/80 min-h-0">
      
      {/* LEFT: CONTENT COMPOSITION SUITE */}
      <div className="flex-1 p-5 md:p-8 flex flex-col gap-6 max-w-4xl overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>DISPATCH ENGINE v3.0</span>
              </span>
              <span className="text-zinc-500 text-xs font-mono">• Real Scheduling Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Social Workspace</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Draft, tone-match, and actually schedule send posts to LinkedIn, X/Twitter, and Instagram.
            </p>
          </div>

          {/* Seed Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPrompt("Announce our Series A round. Bootstrapped to $1.2M ARR with 4 engineers, $0 ad spend. Focus on cash-flow profitability and deterministic systems.");
                showToast('Context seed A loaded.', 'info');
              }}
              className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-white/[0.08] hover:border-white/20 transition flex items-center gap-1.5 font-mono shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-zinc-400" /> Seed A
            </button>
            <button
              onClick={() => {
                setPrompt("Why state machines and immutable store dispatchers are infinitely superior to loose event listeners in client-side applications.");
                showToast('Context seed B loaded.', 'info');
              }}
              className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-white/[0.08] hover:border-white/20 transition flex items-center gap-1.5 font-mono shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-zinc-400" /> Seed B
            </button>
          </div>
        </div>

        {/* AI Prompt & Parameters Card */}
        <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] shadow-2xl space-y-4">
          
          {/* Target Channel Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span>Select Target Social Channel</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                Limit: {currentPlatform.charLimit.toLocaleString()} chars
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(Object.keys(PLATFORMS_CONFIG) as Platform[]).map((pKey) => {
                const p = PLATFORMS_CONFIG[pKey];
                const isActive = activePlatform === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => setActivePlatform(pKey)}
                    className={`relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-zinc-800/80 backdrop-blur-md text-white border-white/20 shadow-md ring-1 ring-white/10' 
                        : 'bg-zinc-950/50 backdrop-blur-md text-zinc-400 border-white/[0.06] hover:border-white/15 hover:text-zinc-200'
                    }`}
                  >
                    <i className={`${p.icon} text-sm`} style={{ color: isActive ? p.color : undefined }} />
                    <span>{p.name}</span>
                    {isActive && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone & Goal Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Editorial Voice & Tone
              </label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full appearance-none bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition cursor-pointer"
                >
                  <option value="Executive Thought Leadership" className="bg-zinc-900 text-zinc-100">Executive Thought Leadership</option>
                  <option value="Direct & Technical" className="bg-zinc-900 text-zinc-100">Direct & Technical (No Fluff)</option>
                  <option value="Contrarian Analytical" className="bg-zinc-900 text-zinc-100">Contrarian Analytical</option>
                  <option value="Product Milestone" className="bg-zinc-900 text-zinc-100">Product Milestone Announcement</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Conversion Objective
              </label>
              <div className="relative">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full appearance-none bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition cursor-pointer"
                >
                  <option value="Maximize Organic Discourse" className="bg-zinc-900 text-zinc-100">Maximize Organic Discourse</option>
                  <option value="High-Intent Link Click-Through" className="bg-zinc-900 text-zinc-100">High-Intent Link Click-Through</option>
                  <option value="Inbound Talent Pipeline" className="bg-zinc-900 text-zinc-100">Inbound Engineering Talent</option>
                  <option value="Brand Moat Expansion" className="bg-zinc-900 text-zinc-100">Brand Moat Expansion</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Prompt Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Context Parameters / Prompt
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">{prompt.length} chars</span>
            </div>
            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Announce our Series A round. Bootstrapped to $1.2M ARR first with 4 engineers, $0 ad spend. Highlight focus on customer retention..."
                className="w-full bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition resize-none leading-relaxed font-sans"
              />
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={insertHashtags}
                  className="text-[11px] font-mono bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded transition border border-white/[0.06]"
                >
                  #tags
                </button>
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded transition"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Generation Progress Bar */}
          {isGenerating && (
            <div className="p-3.5 rounded-xl bg-zinc-900/70 backdrop-blur-md border border-white/[0.08] space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-zinc-200">{genStepText}</span>
                </div>
                <span className="font-mono text-zinc-400">Stage {genStep} of 3</span>
              </div>
              <div className="w-full bg-zinc-950/80 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="bg-white h-full transition-all duration-300"
                  style={{ width: `${(genStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Synthesizing Social Package...' : 'Generate AI Post Package'}</span>
          </button>
        </div>

        {/* Live Draft Editor Card */}
        <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] shadow-2xl space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Active Post Draft</span>
              <span className="text-[10px] font-mono bg-zinc-950/60 backdrop-blur-md text-zinc-300 px-2 py-0.5 rounded border border-white/[0.08] uppercase">
                {currentPlatform.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Character Limit indicator */}
              <div className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md border ${
                isOverLimit 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold' 
                  : 'bg-zinc-950/60 backdrop-blur-md text-zinc-400 border-white/[0.08]'
              }`}>
                <span>{charCount.toLocaleString()} / {currentPlatform.charLimit.toLocaleString()} chars</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-900/70 backdrop-blur-md hover:bg-zinc-800 border border-white/[0.08] transition flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Over Limit Warning */}
          {isOverLimit && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Exceeds {currentPlatform.name} limit by {charCount - currentPlatform.charLimit} characters.</span>
              </div>
              <button onClick={trimToLimit} className="text-[10px] font-mono uppercase underline hover:text-white">
                Auto-Trim
              </button>
            </div>
          )}

          {/* Draft Text Area */}
          <textarea
            rows={7}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition leading-relaxed font-sans resize-y"
            placeholder="Write or edit your post draft here..."
          />

          {/* Scheduling Date/Time Picker & Action Buttons */}
          <div className="pt-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            <div className="flex items-center gap-2.5 bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 text-xs">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="text-zinc-400 font-mono text-[11px]">Schedule For:</span>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSendNow}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/[0.1] bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-800 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Send Immediately</span>
              </button>

              <button
                type="button"
                onClick={handleScheduleSubmit}
                className="flex-1 sm:flex-none bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Commit to Schedule</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT: LIVE DEVICE SIMULATOR & REAL QUEUE ENGINE */}
      <div className="w-full xl:w-[420px] 2xl:w-[460px] p-5 md:p-8 bg-zinc-950/60 backdrop-blur-md border-t xl:border-t-0 xl:border-l border-white/[0.08] flex flex-col gap-6 overflow-y-auto">
        
        {/* Device Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-mobile-screen text-xs text-zinc-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">Live Device Simulation</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900/60 backdrop-blur-md text-zinc-300 border border-white/[0.08]">
              {currentPlatform.name.toUpperCase()} FEED
            </span>
          </div>

          {/* Phone Mockup Frame */}
          <div className="mx-auto w-full max-w-[340px] rounded-[32px] bg-zinc-950/80 backdrop-blur-md border border-white/[0.12] shadow-2xl overflow-hidden relative">
            
            {/* Phone Notch */}
            <div className="pt-2.5 pb-2 px-5 flex justify-between items-center bg-zinc-950/90 text-zinc-400 text-[10px] font-mono border-b border-white/[0.06]">
              <span className="font-semibold text-white">9:41</span>
              <div className="w-14 h-3 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </div>
              <div className="flex items-center gap-1 text-[9px]">
                <i className="fa-solid fa-signal" />
                <i className="fa-solid fa-wifi" />
                <i className="fa-solid fa-battery-full" />
              </div>
            </div>

            {/* Post Feed Content */}
            <div className="p-4 bg-zinc-950/50 backdrop-blur-md text-zinc-100 min-h-[380px] max-h-[440px] overflow-y-auto flex flex-col justify-between">
              <div>
                {/* Author Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800/90 border border-white/[0.1] flex items-center justify-center font-mono font-bold text-xs text-white">
                      {user ? (user.displayName || user.email || 'AM').slice(0, 2).toUpperCase() : 'AM'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-white">
                          {user?.displayName || 'Alex Morgan'}
                        </span>
                        <i className="fa-solid fa-circle-check text-[10px] text-emerald-400" />
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono">{currentPlatform.headline}</p>
                    </div>
                  </div>
                  <i className={`${currentPlatform.icon} text-xs`} style={{ color: currentPlatform.color }} />
                </div>

                {/* Simulated Post Text */}
                <div className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line break-words">
                  {draft || 'Draft text will mirror here in real time...'}
                </div>

                {/* Simulated Link Card */}
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-zinc-900/50 backdrop-blur-md my-3">
                  <div className="h-20 bg-gradient-to-tr from-zinc-900/80 via-zinc-850/60 to-zinc-900/80 flex items-center justify-center p-2 text-center">
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/[0.08]">
                        Target Asset
                      </span>
                      <h4 className="text-[11px] font-bold text-white mt-1">VibeScribe OS — Social Scheduler</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Metrics Bar */}
              <div className="pt-2 border-t border-white/[0.06] text-[10px] text-zinc-400 font-mono">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <TrendingUp className="w-3 h-3 text-zinc-400" /> 240 reach
                  </span>
                  <span>24 likes • 8 shares</span>
                </div>
              </div>
            </div>

            {/* Home bar */}
            <div className="py-2 flex justify-center bg-zinc-950/80">
              <div className="w-20 h-1 bg-zinc-800 rounded-full" />
            </div>

          </div>
        </div>

        {/* Real-time Scheduled Queue List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">Dispatched & Scheduled Queue</h3>
            </div>
            <span className="text-[11px] font-mono bg-zinc-900/60 backdrop-blur-md text-zinc-300 px-2 py-0.5 rounded border border-white/[0.08]">
              {posts.length} posts
            </span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {posts.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-white/[0.08] bg-zinc-900/30 backdrop-blur-md text-zinc-500 text-xs font-mono">
                No posts scheduled yet. Use the composition suite on the left to schedule your first post.
              </div>
            ) : (
              posts.map((item) => {
                const conf = PLATFORMS_CONFIG[item.platform] || PLATFORMS_CONFIG.linkedin;
                const snippet = item.body.split('\n')[0].slice(0, 50) + (item.body.length > 50 ? '...' : '');

                let badge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if (item.status === 'draft') badge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if (item.status === 'failed') badge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                if (item.status === 'scheduled') badge = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';

                return (
                  <div key={item.id} className="p-3 rounded-xl bg-zinc-900/40 backdrop-blur-md border border-white/[0.07] hover:border-white/20 hover:bg-zinc-900/60 transition flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-7 h-7 rounded-lg ${conf.badgeClass} flex items-center justify-center shrink-0 text-xs`}>
                        <i className={conf.icon} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-zinc-200 truncate">{snippet}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
                          <span>{new Date(item.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="capitalize">{item.platform}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          const nextStatus = item.status === 'scheduled' ? 'sent' : item.status === 'sent' ? 'draft' : 'scheduled';
                          updatePostStatus(item.id, nextStatus);
                        }}
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border transition ${badge}`}
                      >
                        {item.status}
                      </button>

                      {item.status === 'scheduled' && (
                        <button
                          onClick={() => sendImmediately(item.id)}
                          title="Send immediately"
                          className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-zinc-800"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => deletePost(item.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-800 transition"
                      >
                        <i className="fa-regular fa-trash-can text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
