'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { signOutUser } from '@/lib/firebase/auth';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  continueAsGuest: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest user session exists in sessionStorage
    const guestUser = typeof window !== 'undefined' ? sessionStorage.getItem('tokenflow_guest') : null;
    if (guestUser) {
      try {
        setUser(JSON.parse(guestUser));
        setLoading(false);
      } catch {
        // ignore invalid JSON
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        // Active Firebase User
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL,
          isGuest: false,
        });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('tokenflow_guest');
        }
      } else if (!guestUser) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (user?.isGuest) {
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('tokenflow_guest');
      }
      return;
    }
    await signOutUser();
    setUser(null);
  };

  const continueAsGuest = () => {
    const guest: AuthUser = {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: 'guest@tokenflow.demo',
      displayName: 'Guest User',
      photoURL: null,
      isGuest: true,
    };
    setUser(guest);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tokenflow_guest', JSON.stringify(guest));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
