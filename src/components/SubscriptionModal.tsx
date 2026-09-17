import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier, SubscriptionPlanDetails } from '../types';
import { X, Check, Zap, Sparkles, Shield, CreditCard, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS: SubscriptionPlanDetails[] = [
  {
    tier: 'free',
    name: 'Starter',
    tagline: 'For creators testing cross-channel presence',
    priceMonthly: 0,
    priceAnnual: 0,
    postLimitPerMonth: 15,
    features: [
      '15 scheduled posts per month',
      'Basic LinkedIn & X/Twitter publishing',
      'Real-time device preview',
      'Standard community queue'
    ]
  },
  {
    tier: 'pro',
    name: 'Pro Creator',
    tagline: 'High-frequency growth & automated scheduling',
    priceMonthly: 29,
    priceAnnual: 24,
    postLimitPerMonth: 150,
    recommended: true,
    features: [
      '150 scheduled posts per month',
      'LinkedIn, X/Twitter, & Instagram dispatch',
      'Instant Send & Background Auto-Scheduler',
      'Multi-stage generative AI tone styling',
      'Live Channel Telemetry & Analytics',
      'Connected Social Accounts manager'
    ]
  },
  {
    tier: 'enterprise',
    name: 'Agency & Scale',
    tagline: 'Unlimited power for teams & multi-brand setups',
    priceMonthly: 99,
    priceAnnual: 79,
    postLimitPerMonth: 2000,
    features: [
      '2,000 scheduled posts per month',
      'Sub-second scheduled dispatch engine',
      'Hardware security keys & API token access',
      'Automated retry for failed social APIs',
      'Role-based account security (RBAC)',
      'Dedicated priority queue worker'
    ]
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateSubscription } = useAuth();
  const [annualBilling, setAnnualBilling] = useState(false);
  const [processingTier, setProcessingTier] = useState<SubscriptionTier | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = profile?.subscriptionTier || 'free';

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (tier === currentTier) return;
    setProcessingTier(tier);
    setSuccessMessage(null);

    try {
      await updateSubscription(tier);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setSuccessMessage(`Successfully updated to ${tier.toUpperCase()} plan!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1600);
    } catch (err) {
      console.error('Failed to update subscription:', err);
    } finally {
      setProcessingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-zinc-900/80 backdrop-blur-md border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Decor */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800/80 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REAL-TIME DISPATCH CAPACITY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Flexible Plans for Serious Creators
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Upgrade to unlock higher monthly post quotas, instant background sending, and priority social media dispatch pipelines.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-3 mt-5 p-1 bg-zinc-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !annualBilling ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                annualBilling ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">20% OFF</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/15 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center">
            {successMessage}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            const price = annualBilling ? plan.priceAnnual : plan.priceMonthly;
            const isProcessing = processingTier === plan.tier;

            return (
              <div 
                key={plan.tier}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all backdrop-blur-md ${
                  plan.recommended 
                    ? 'bg-zinc-900/70 border-2 border-zinc-300 shadow-2xl' 
                    : 'bg-zinc-900/40 border border-white/[0.08] hover:border-white/20'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-zinc-950 text-[10px] font-bold font-mono tracking-wider shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white tracking-tight">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        CURRENT PLAN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{plan.tagline}</p>

                  <div className="my-5 pb-5 border-b border-zinc-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">${price}</span>
                      <span className="text-xs text-zinc-400 font-mono">/ month</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1">
                      {plan.postLimitPerMonth.toLocaleString()} posts capacity / mo
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-800/80">
                  <button
                    onClick={() => handleSelectPlan(plan.tier)}
                    disabled={isCurrent || isProcessing}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrent 
                        ? 'bg-zinc-850 text-zinc-500 border border-zinc-800 cursor-default'
                        : plan.recommended
                          ? 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-md active:scale-[0.99]'
                          : 'bg-zinc-800/80 hover:bg-zinc-700 text-white border border-white/[0.08] active:scale-[0.99]'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isCurrent ? (
                      'Active Plan'
                    ) : (
                      <>
                        <span>Upgrade to {plan.name}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / Billing Badge */}
        <div className="mt-8 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>256-bit TLS Encrypted Transaction • Instant Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-400" />
            <span>Accepts Visa, Mastercard, AMEX & Apple Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};
