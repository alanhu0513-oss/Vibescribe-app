export type Platform = 'linkedin' | 'twitter' | 'instagram';
export type PostStatus = 'scheduled' | 'sent' | 'published' | 'draft' | 'failed';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string; // Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  monthlyPostLimit: number;
  postsUsedThisMonth: number;
  role: 'user' | 'admin';
  twoFactorEnabled: boolean;
  securityKeyHash?: string;
  apiTokens?: Array<{
    id: string;
    name: string;
    keyPreview: string;
    createdAt: string;
  }>;
  connectedAccounts?: {
    linkedin?: { connected: boolean; handle?: string; lastSync?: string };
    twitter?: { connected: boolean; handle?: string; lastSync?: string };
    instagram?: { connected: boolean; handle?: string; lastSync?: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  platform: Platform;
  body: string;
  scheduledAt: string; // ISO string
  status: PostStatus;
  sentAt?: string; // ISO string when actually sent
  tone?: string;
  goal?: string;
  tags?: string[];
  metrics?: {
    impressions: number;
    likes: number;
    reposts: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type Post = SocialPost;

export interface BillingInvoice {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  amount: number;
  currency: string;
  status: 'paid' | 'pending';
  invoiceNumber: string;
  paymentMethod: string;
  date: string;
}

export interface SubscriptionPlanDetails {
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  postLimitPerMonth: number;
  features: string[];
  recommended?: boolean;
}
