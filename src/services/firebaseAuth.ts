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

// Helper to load Google Identity Services (GIS) script dynamically
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Triggers authentic Google OAuth Popup with account selection prompt
 */
export async function signInWithGoogleOAuth(): Promise<{
  success: boolean;
  email?: string;
  name?: string;
  photoURL?: string;
  error?: string;
}> {
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || (typeof window !== 'undefined' ? localStorage.getItem('pe_google_client_id') : null);
  const firebaseKey = env.VITE_FIREBASE_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('pe_firebase_api_key') : null);

  // OPTION 1: Google Identity Services (via Google Cloud Console Client ID)
  if (googleClientId) {
    try {
      await loadGsiScript();
      return await new Promise((resolve) => {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              resolve({ success: false, error: tokenResponse.error_description || 'Google sign-in was cancelled.' });
              return;
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const info = await res.json();
              resolve({
                success: true,
                email: info.email,
                name: info.name || info.email?.split('@')[0],
                photoURL: info.picture
              });
            } catch (err: any) {
              resolve({ success: false, error: 'Failed to retrieve Google profile info.' });
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
      });
    } catch (err: any) {
      console.warn('[Google GIS Auth] error:', err);
    }
  }

  // OPTION 2: Firebase Auth (if valid API key is present)
  const isRealFirebaseKey = firebaseKey && firebaseKey !== "AIzaSyDemoEvaluatorKeyForRealAuth";
  if (isRealFirebaseKey) {
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
      console.warn('[Firebase Auth] Google OAuth Popup notice:', err?.code, err?.message || err);
      
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Google sign-in was cancelled.' };
      }

      if (err?.code === 'auth/invalid-api-key' || err?.code === 'auth/api-key-not-valid') {
        return {
          success: false,
          error: 'The Firebase API Key provided is not valid. Please check your Google Cloud / Firebase console credentials.'
        };
      }

      return {
        success: false,
        error: err?.message || 'Google Sign-In popup could not be completed.'
      };
    }
  }

  return {
    success: false,
    error: 'Google OAuth credentials not configured in .env'
  };
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

