/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut
} from 'firebase/auth';

const env = (import.meta as any).env || {};

// Firebase configuration (uses environment variables or safe defaults)
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDemoEvaluatorKeyForRealAuth",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "presentation-evaluator.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "presentation-evaluator",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "presentation-evaluator.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo1234567890"
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom Google OAuth Scopes & Parameters
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces device Google Account Chooser prompt
});

/**
 * Triggers authentic Google OAuth Popup to select device email or add new email account
 */
export async function signInWithGoogleOAuth(): Promise<{
  success: boolean;
  email?: string;
  name?: string;
  photoURL?: string;
  error?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      email: user.email || undefined,
      name: user.displayName || undefined,
      photoURL: user.photoURL || undefined
    };
  } catch (err: any) {
    console.warn('[Firebase Auth] Google OAuth Popup notice:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Google Sign-In prompt closed or unavailable.'
    };
  }
}

/**
 * Signs out from Firebase Auth
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Firebase SignOut error:', err);
  }
}
