import { initializeApp, getApps, deleteApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY = 'creovate-firebase-config';

// Load initial config from env or localStorage
export function loadSavedConfig(): FirebaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
}

export let firebaseConfig: FirebaseConfig = loadSavedConfig();
export let isDemoMode = !firebaseConfig.apiKey || !firebaseConfig.projectId;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function initFirebaseInstances(config: FirebaseConfig) {
  if (!config.apiKey || !config.projectId) {
    isDemoMode = true;
    app = null;
    auth = null;
    firestore = null;
    storage = null;
    return;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp(config);
    }
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    isDemoMode = false;
  } catch (error) {
    console.warn('Firebase initialization notice (falling back to hybrid demo mode):', error);
    isDemoMode = true;
  }
}

// Initial bootstrap
initFirebaseInstances(firebaseConfig);

export async function configureFirebase(config: FirebaseConfig): Promise<boolean> {
  try {
    firebaseConfig = { ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Delete existing apps to re-init
    const existingApps = getApps();
    for (const existingApp of existingApps) {
      await deleteApp(existingApp);
    }

    initFirebaseInstances(config);
    window.dispatchEvent(new CustomEvent('creovate-firebase-updated'));
    return !isDemoMode;
  } catch (err) {
    console.error('Failed to configure Firebase:', err);
    return false;
  }
}

export async function resetToDemoMode(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  };
  const existingApps = getApps();
  for (const existingApp of existingApps) {
    await deleteApp(existingApp);
  }
  isDemoMode = true;
  app = null;
  auth = null;
  firestore = null;
  storage = null;
  window.dispatchEvent(new CustomEvent('creovate-firebase-updated'));
}

export function getFirebaseStatus() {
  return {
    isConfigured: !isDemoMode && !!firestore,
    projectId: firebaseConfig.projectId || 'creovate-demo-sandbox',
    authDomain: firebaseConfig.authDomain || 'creovate.local',
    firestoreActive: !!firestore,
    isDemoMode,
  };
}

export { app, auth, firestore, storage };
