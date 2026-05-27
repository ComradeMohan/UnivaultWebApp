import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

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


export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  return { app, auth, firestore };
}

export { FirebaseProvider } from './provider';
export { useFirebaseApp, useAuth, useFirestore, useUser } from './provider';
export { FirebaseClientProvider } from './client-provider';
