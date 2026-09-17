import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { UserProfile, SubscriptionTier } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithDemo: () => Promise<void>;
  logout: () => Promise<void>;
  updateSubscription: (tier: SubscriptionTier) => Promise<void>;
  toggleTwoFactor: () => Promise<void>;
  generateApiKey: (name: string) => Promise<string>;
  revokeApiKey: (keyId: string) => Promise<void>;
  updateConnectedAccount: (platform: 'linkedin' | 'twitter' | 'instagram', connected: boolean, handle?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile document from Firestore
  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      setProfile(data);
      return data;
    } else {
      // Default to Pro trial or Free with generous quota
      const newProfile: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Creator'),
        photoURL: firebaseUser.photoURL || undefined,
        subscriptionTier: 'pro', // Give 14-day Pro trial on signup
        subscriptionStatus: 'active',
        monthlyPostLimit: 150,
        postsUsedThisMonth: 0,
        role: 'user',
        twoFactorEnabled: false,
        securityKeyHash: 'sec_' + Math.random().toString(36).substring(2, 12),
        apiTokens: [
          {
            id: 'tok_default',
            name: 'Production Dispatch Key',
            keyPreview: 'vs_live_' + Math.random().toString(36).substring(2, 8) + '...',
            createdAt: new Date().toISOString()
          }
        ],
        connectedAccounts: {
          linkedin: { connected: true, handle: (firebaseUser.email?.split('@')[0] || 'user') + '-in', lastSync: 'Just now' },
          twitter: { connected: true, handle: '@' + (firebaseUser.email?.split('@')[0] || 'user'), lastSync: 'Just now' },
          instagram: { connected: false }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(userDocRef, {
        ...newProfile,
        serverCreatedAt: serverTimestamp()
      });

      setProfile(newProfile);
      return newProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await fetchOrCreateProfile(currentUser);
        } catch (err) {
          console.error('Error fetching/creating user profile:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await fetchOrCreateProfile(res.user);
      }
    } catch (error: any) {
      // User explicitly closed or canceled the popup, or browser blocked duplicate popup
      if (
        error?.code === 'auth/popup-closed-by-user' || 
        error?.code === 'auth/cancelled-popup-request'
      ) {
        // Benign cancellation: do not log as console.error
        return;
      }
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await fetchOrCreateProfile(res.user);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      await fetchOrCreateProfile(res.user);
    }
  };

  const signInWithDemo = async () => {
    const demoEmail = 'creator.demo@vibescribe.ai';
    const demoPass = 'demoCreator2026!';
    try {
      const res = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      if (res.user) {
        await fetchOrCreateProfile(res.user);
      }
    } catch (e: any) {
      if (e?.code === 'auth/user-not-found' || e?.code === 'auth/invalid-credential') {
        const res = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        if (res.user) {
          await updateProfile(res.user, { displayName: 'Alex Rivera (Pro Creator)' });
          await fetchOrCreateProfile(res.user);
        }
      } else {
        throw e;
      }
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateSubscription = async (tier: SubscriptionTier) => {
    if (!user || !profile) return;
    const limits = {
      free: 15,
      pro: 150,
      enterprise: 2000
    };

    const updated = {
      ...profile,
      subscriptionTier: tier,
      monthlyPostLimit: limits[tier],
      subscriptionStatus: 'active' as const,
      updatedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      subscriptionTier: tier,
      monthlyPostLimit: limits[tier],
      subscriptionStatus: 'active',
      updatedAt: new Date().toISOString()
    });

    // Also record subscription invoice
    const invoiceDoc = doc(db, 'subscriptions', 'inv_' + Date.now());
    await setDoc(invoiceDoc, {
      id: 'inv_' + Date.now(),
      userId: user.uid,
      tier,
      amount: tier === 'free' ? 0 : tier === 'pro' ? 29 : 99,
      currency: 'USD',
      interval: 'month',
      status: 'paid',
      invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      paymentMethod: 'Visa ending 4242 (Secure Encrypted)',
      createdAt: new Date().toISOString()
    });

    setProfile(updated);
  };

  const toggleTwoFactor = async () => {
    if (!user || !profile) return;
    const nextState = !profile.twoFactorEnabled;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      twoFactorEnabled: nextState,
      updatedAt: new Date().toISOString()
    });
    setProfile({
      ...profile,
      twoFactorEnabled: nextState
    });
  };

  const generateApiKey = async (name: string): Promise<string> => {
    if (!user || !profile) throw new Error('Not authenticated');
    const secret = 'vs_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const tokenItem = {
      id: 'tok_' + Date.now(),
      name: name || 'API Token',
      keyPreview: secret.substring(0, 12) + '••••••••••••••••',
      createdAt: new Date().toISOString()
    };

    const updatedTokens = [...(profile.apiTokens || []), tokenItem];
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      apiTokens: updatedTokens,
      updatedAt: new Date().toISOString()
    });

    setProfile({
      ...profile,
      apiTokens: updatedTokens
    });

    return secret;
  };

  const revokeApiKey = async (keyId: string) => {
    if (!user || !profile) return;
    const updatedTokens = (profile.apiTokens || []).filter(t => t.id !== keyId);
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      apiTokens: updatedTokens,
      updatedAt: new Date().toISOString()
    });
    setProfile({
      ...profile,
      apiTokens: updatedTokens
    });
  };

  const updateConnectedAccount = async (platform: 'linkedin' | 'twitter' | 'instagram', connected: boolean, handle?: string) => {
    if (!user || !profile) return;
    const current = profile.connectedAccounts || {};
    const updatedConnected = {
      ...current,
      [platform]: {
        connected,
        handle: connected ? (handle || '@' + (profile.displayName || 'user')) : undefined,
        lastSync: connected ? 'Just now' : undefined
      }
    };

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      connectedAccounts: updatedConnected,
      updatedAt: new Date().toISOString()
    });

    setProfile({
      ...profile,
      connectedAccounts: updatedConnected
    });
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchOrCreateProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInWithDemo,
      logout,
      updateSubscription,
      toggleTwoFactor,
      generateApiKey,
      revokeApiKey,
      updateConnectedAccount,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
