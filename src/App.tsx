import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { usePosts } from './context/PostsContext';
import { Workspace } from './components/Workspace';
import { Analytics } from './components/Analytics';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SecurityModal } from './components/SecurityModal';
import { 
  Terminal, 
  BarChart3, 
  ShieldCheck, 
  CreditCard, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  Bell, 
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const { dispatchedNotifications, clearNotifications, posts } = usePosts();

  const [currentView, setCurrentView] = useState<'workspace' | 'analytics'>('workspace');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = 't_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const prevNotificationsLenRef = useRef(dispatchedNotifications.length);
  useEffect(() => {
    if (dispatchedNotifications.length > prevNotificationsLenRef.current) {
      const latest = dispatchedNotifications[0];
      if (latest) {
        showToast(latest.message, 'success');
      }
    }
    prevNotificationsLenRef.current = dispatchedNotifications.length;
  }, [dispatchedNotifications]);

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-zinc-700 selection:text-white relative overflow-hidden">
      {/* Ambient background light gradients to provide refractive depth for glassmorphism */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-indigo-600/8 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-emerald-600/6 blur-[140px]" />
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-zinc-700/8 blur-[120px]" />
      </div>
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border text-xs shadow-2xl backdrop-blur-md transition-all ${
              toast.type === 'success' 
                ? 'bg-zinc-900/80 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                  ? 'bg-zinc-900/80 border-rose-500/40 text-rose-300'
                  : 'bg-zinc-900/80 border-white/10 text-zinc-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : toast.type === 'error' ? (
                <Lock className="w-4 h-4 text-rose-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-zinc-400" />
              )}
            </div>
            <p className="flex-1 font-medium leading-relaxed break-words">{toast.message}</p>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-zinc-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Bar on Mobile */}
      <header className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-zinc-950/70 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-extrabold text-sm shadow-sm">
            <i className="fa-solid fa-feather-pointed text-xs" />
          </div>
          <span className="font-bold tracking-tight text-white text-sm">VibeScribe <span className="font-mono text-xs text-zinc-400">OS</span></span>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button 
              onClick={() => setSecurityModalOpen(true)}
              className="w-8 h-8 rounded-lg bg-zinc-800/80 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white"
            >
              {(user.displayName || user.email || 'AM').slice(0, 2).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => { setAuthModalMode('signin'); setAuthModalOpen(true); }}
              className="text-xs bg-white text-zinc-950 font-bold px-3 py-1.5 rounded-lg"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-xl bg-zinc-900/70 backdrop-blur-md border border-white/[0.08] text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Desktop / Mobile Navigation Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 lg:w-64 xl:w-72 bg-zinc-950/75 backdrop-blur-md border-r border-white/[0.08] shadow-2xl flex flex-col justify-between p-5 transition-transform duration-300 lg:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          
          <div className="space-y-6">
            
            {/* Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-base shadow-sm">
                  <i className="fa-solid fa-feather-pointed" />
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    VibeScribe <span className="font-mono text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">OS</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Enterprise Content Engine</p>
                </div>
              </div>
            </div>

            {/* Core Engines Nav */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-3 mb-1 block">
                Platform Engines
              </span>

              <button
                onClick={() => { setCurrentView('workspace'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  currentView === 'workspace'
                    ? 'text-white bg-zinc-900 border border-zinc-800 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <Terminal className="w-4 h-4 text-zinc-300" />
                <span className="tracking-tight">Workspace</span>
                <span className="ml-auto text-[9px] font-mono uppercase bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                  ACTIVE
                </span>
              </button>

              <button
                onClick={() => { setCurrentView('analytics'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  currentView === 'analytics'
                    ? 'text-white bg-zinc-900 border border-zinc-800 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-zinc-300" />
                <span className="tracking-tight">Analytics & Telemetry</span>
                <span className="ml-auto text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  {posts.length}
                </span>
              </button>
            </div>

            {/* Subscription Card Widget */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/[0.08] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {profile?.subscriptionTier || 'Free'} Plan
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                  <span>Monthly Post Quota:</span>
                  <span className="text-white font-bold">{profile?.postsUsedThisMonth || 0} / {profile?.monthlyPostLimit || 15}</span>
                </div>
                <div className="w-full bg-zinc-950/80 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (((profile?.postsUsedThisMonth || 0) / (profile?.monthlyPostLimit || 15)) * 100))}%` 
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSubscriptionModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Manage Subscriptions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Security Quick Link */}
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="w-full p-3 rounded-xl bg-zinc-900/30 backdrop-blur-md border border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/50 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">Account Security</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">2FA & API Tokens</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
            </button>

            {/* Dispatched Live Activity Toast List */}
            {dispatchedNotifications.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-900/40 backdrop-blur-md border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Background Activity
                  </span>
                  <button onClick={clearNotifications} className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono">
                    Clear
                  </button>
                </div>
                {dispatchedNotifications.slice(0, 2).map(notif => (
                  <p key={notif.id} className="text-[11px] text-zinc-300 font-sans leading-tight">
                    {notif.message}
                  </p>
                ))}
              </div>
            )}

          </div>

          {/* User Account / Sign In Footer */}
          <div className="pt-4 border-t border-white/[0.08]">
            {user ? (
              <div className="p-2.5 rounded-xl bg-zinc-900/40 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/[0.08] flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                    {(user.displayName || user.email || 'AM').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono truncate">
                      {profile?.role === 'admin' ? 'Administrator' : 'Verified Creator'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 transition shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => { setAuthModalMode('signin'); setAuthModalOpen(true); }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              </div>
            )}
          </div>

        </aside>

        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-30 lg:hidden"
          />
        )}

        {/* Center Main Stage Content */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-transparent flex flex-col">
          {currentView === 'workspace' ? (
            <Workspace 
              onOpenAuth={() => setAuthModalOpen(true)}
              onOpenSubscription={() => setSubscriptionModalOpen(true)}
              showToast={showToast}
            />
          ) : (
            <Analytics 
              onNavigateWorkspace={() => setCurrentView('workspace')}
              showToast={showToast}
            />
          )}
        </main>

      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      <SecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

    </div>
  );
}
