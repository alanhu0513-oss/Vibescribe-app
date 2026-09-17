import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  Lock,
  ExternalLink
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const { 
    profile, 
    toggleTwoFactor, 
    generateApiKey, 
    revokeApiKey, 
    updateConnectedAccount 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'security' | 'api' | 'accounts'>('security');
  const [newKeyName, setNewKeyName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen) return null;

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setLoadingAction(true);
    try {
      const secret = await generateApiKey(newKeyName);
      setCreatedSecret(secret);
      setNewKeyName('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-zinc-900/80 backdrop-blur-md border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800/80 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-zinc-800/80 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-emerald-400 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Account & Security Center</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Manage 2FA, dispatch API keys, and connected publishing profiles.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800/80 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-xs font-semibold px-3 transition-colors border-b-2 ${
              activeTab === 'security'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Authentication & 2FA
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`pb-3 text-xs font-semibold px-3 transition-colors border-b-2 ${
              activeTab === 'accounts'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Connected Channels
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 text-xs font-semibold px-3 transition-colors border-b-2 ${
              activeTab === 'api'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            API Dispatch Keys
          </button>
        </div>

        {/* Tab 1: Security & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-zinc-800/80 border border-white/[0.08] text-zinc-300 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                    Require verification before scheduling bulk posts or modifying API credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTwoFactor}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  profile?.twoFactorEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08]'
                }`}
              >
                {profile?.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white">Cryptographic Security Signature</h4>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-white/[0.08]">SHA-256</span>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Every dispatched post is cryptographically hashed with your private key before sending.
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-950/60 font-mono text-xs text-zinc-400 border border-white/[0.08] break-all">
                {profile?.securityKeyHash || 'sec_8f92a10b44c829e'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Session Security</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Authenticated via Google Cloud Identity Platform</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Verified
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Connected Channels */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 mb-3">
              Configure target credentials where posts will be automatically published upon reaching their scheduled timestamp.
            </p>

            {/* LinkedIn */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0a66c2]/15 border border-[#0a66c2]/30 flex items-center justify-center text-[#0a66c2] text-lg font-bold">
                  <i className="fa-brands fa-linkedin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">LinkedIn Profile & Company Page</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {profile?.connectedAccounts?.linkedin?.connected 
                      ? `Connected as ${profile.connectedAccounts.linkedin.handle}` 
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateConnectedAccount('linkedin', !profile?.connectedAccounts?.linkedin?.connected, 'alex-growth-leader')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  profile?.connectedAccounts?.linkedin?.connected
                    ? 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08]'
                    : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-sm'
                }`}
              >
                {profile?.connectedAccounts?.linkedin?.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* X / Twitter */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-white/[0.08] flex items-center justify-center text-white text-lg">
                  <i className="fa-brands fa-x-twitter" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">X / Twitter Account</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {profile?.connectedAccounts?.twitter?.connected 
                      ? `Connected as ${profile.connectedAccounts.twitter.handle}` 
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateConnectedAccount('twitter', !profile?.connectedAccounts?.twitter?.connected, '@alexmorgan_ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  profile?.connectedAccounts?.twitter?.connected
                    ? 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08]'
                    : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-sm'
                }`}
              >
                {profile?.connectedAccounts?.twitter?.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Instagram */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 text-lg">
                  <i className="fa-brands fa-instagram" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instagram Business Creator</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {profile?.connectedAccounts?.instagram?.connected 
                      ? `Connected as ${profile.connectedAccounts.instagram.handle}` 
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateConnectedAccount('instagram', !profile?.connectedAccounts?.instagram?.connected, '@vibescribe.build')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  profile?.connectedAccounts?.instagram?.connected
                    ? 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08]'
                    : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-sm'
                }`}
              >
                {profile?.connectedAccounts?.instagram?.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: API Keys */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <form onSubmit={handleGenerateKey} className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Token name (e.g. CI/CD Dispatcher)"
                className="flex-1 bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
              />
              <button
                type="submit"
                disabled={loadingAction || !newKeyName.trim()}
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Create Key</span>
              </button>
            </form>

            {createdSecret && (
              <div className="p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <p className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <Lock className="w-3.5 h-3.5" /> Save this token now! It will not be shown again.
                </p>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 font-mono text-zinc-200 border border-amber-500/20">
                  <span className="truncate mr-2">{createdSecret}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdSecret)}
                    className="p-1 hover:text-white text-zinc-400"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Active Keys</h4>
              {profile?.apiTokens && profile.apiTokens.length > 0 ? (
                profile.apiTokens.map((tok) => (
                  <div key={tok.id} className="p-3.5 rounded-xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{tok.name}</p>
                      <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{tok.keyPreview}</p>
                    </div>
                    <button
                      onClick={() => revokeApiKey(tok.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                      title="Revoke key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 font-mono">No API tokens created.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
