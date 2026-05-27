'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { initializeFirebase, FirebaseProvider } from './index'; // Corrected import
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';

// Safeguard for Node.js 25+ where an experimental, incomplete global `localStorage` is defined on the server side
if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
  try {
    const localstorage = (globalThis as any).localStorage;
    if (!localstorage || typeof localstorage.getItem !== 'function') {
      delete (globalThis as any).localStorage;
    }
  } catch (e) {
    // Silently ignore deletion failures
  }
}

import { type Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

const FirebaseContext = createContext<{
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
} | null>(null);

export const FirebaseClientProvider: React.FC<FirebaseClientProviderProps> = ({
  children,
}) => {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { app, auth, firestore } = await initializeFirebase();
      setFirebase({ app, auth, firestore });
    };
    init();
  }, []);

  if (!firebase) {
    return null; // Or a loading spinner
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
};
