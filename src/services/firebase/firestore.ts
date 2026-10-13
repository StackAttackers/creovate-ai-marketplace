import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore, isDemoMode } from './config';
import { demoCreators } from '../demo/creators';
import { demoCampaigns } from '../demo/campaigns';
import type { CreatorProfile } from '../../types/creator';
import type { Campaign } from '../../types/campaign';
import type { User } from '../../types/user';
import type { Invitation } from '../../types/invitation';

// ─────────────────────────────────────────────────────────────
// 1. AI CREATOR & AGENCY PROFILES IN FIRESTORE
// ─────────────────────────────────────────────────────────────

/**
 * Saves an AI Creator or AI Agency profile to Cloud Firestore
 * Stores in `creatorProfiles` and optionally mirrors to `agencies` collection
 */
export async function saveCreatorProfileToFirestore(profile: CreatorProfile): Promise<boolean> {
  // Always update local cache for instant zero-latency UI
  try {
    const customData = localStorage.getItem('creovate-creators');
    const customCreators: Record<string, CreatorProfile> = customData ? JSON.parse(customData) : {};
    customCreators[profile.uid] = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('creovate-creators', JSON.stringify(customCreators));
  } catch {
    // Non-blocking
  }

  // Persist to Live Firestore if configured
  if (!isDemoMode && firestore) {
    try {
      const docRef = doc(firestore, 'creatorProfiles', profile.uid);
      await setDoc(docRef, {
        ...profile,
        firestoreUpdatedAt: serverTimestamp(),
      }, { merge: true });

      // If registered as an agency, mirror to dedicated agencies collection
      if (profile.role === 'agency') {
        const agencyRef = doc(firestore, 'agencies', profile.uid);
        await setDoc(agencyRef, {
          ...profile,
          agencyType: 'AI Production Studio',
          firestoreUpdatedAt: serverTimestamp(),
        }, { merge: true });
      }

      console.log(`[Firestore] Successfully saved ${profile.role || 'creator'} profile: ${profile.displayName} (${profile.uid})`);
      return true;
    } catch (err) {
      console.warn('[Firestore] Failed to write to Cloud Firestore, saved locally:', err);
      return false;
    }
  }

  return true;
}

/**
 * Fetches all Creator & Agency profiles from Firestore (with local fallback)
 */
export async function fetchCreatorsFromFirestore(): Promise<CreatorProfile[]> {
  if (!isDemoMode && firestore) {
    try {
      const snap = await getDocs(collection(firestore, 'creatorProfiles'));
      if (!snap.empty) {
        const firestoreCreators = snap.docs.map((d) => d.data() as CreatorProfile);
        
        // Merge with demo creators to ensure rich content
        const combined = [...firestoreCreators];
        demoCreators.forEach((demo) => {
          if (!combined.some((c) => c.uid === demo.uid)) {
            combined.push(demo);
          }
        });
        return combined;
      }
    } catch (err) {
      console.warn('[Firestore] Fetch creators failed, falling back to cached roster:', err);
    }
  }

  // Fallback to local store / demo creators
  try {
    const customData = localStorage.getItem('creovate-creators');
    if (customData) {
      const customCreators: Record<string, CreatorProfile> = JSON.parse(customData);
      const merged = demoCreators.map((d) => (customCreators[d.uid] ? { ...d, ...customCreators[d.uid] } : d));
      Object.values(customCreators).forEach((c) => {
        if (!merged.some((m) => m.uid === c.uid)) {
          merged.unshift(c);
        }
      });
      return merged;
    }
  } catch {
    // Ignore
  }

  return demoCreators;
}

/**
 * Fetches a single creator or agency profile by ID from Firestore
 */
export async function fetchCreatorByIdFromFirestore(id: string): Promise<CreatorProfile | undefined> {
  if (!isDemoMode && firestore) {
    try {
      const snap = await getDoc(doc(firestore, 'creatorProfiles', id));
      if (snap.exists()) {
        return snap.data() as CreatorProfile;
      }
    } catch (err) {
      console.warn(`[Firestore] Fetch creator ${id} failed:`, err);
    }
  }

  const all = await fetchCreatorsFromFirestore();
  return all.find((c) => c.uid === id);
}

/**
 * Fetches only AI Agency profiles from Firestore
 */
export async function fetchAgenciesFromFirestore(): Promise<CreatorProfile[]> {
  if (!isDemoMode && firestore) {
    try {
      const q = query(collection(firestore, 'creatorProfiles'), where('role', '==', 'agency'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as CreatorProfile);
      }
    } catch (err) {
      console.warn('[Firestore] Fetch agencies failed:', err);
    }
  }

  const all = await fetchCreatorsFromFirestore();
  return all.filter((c) => c.role === 'agency');
}

/**
 * Subscribes to real-time updates for creators & agencies from Firestore
 */
export function subscribeToCreators(onUpdate: (creators: CreatorProfile[]) => void): () => void {
  if (!isDemoMode && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, 'creatorProfiles'),
        (snapshot) => {
          const list = snapshot.docs.map((docSnap) => docSnap.data() as CreatorProfile);
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (err) => console.warn('[Firestore] Realtime subscription notice:', err)
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[Firestore] subscribeToCreators initialization error:', err);
    }
  }
  return () => {};
}

// ─────────────────────────────────────────────────────────────
// 2. USER AUTHENTICATION PROFILES IN FIRESTORE
// ─────────────────────────────────────────────────────────────

/**
 * Saves a registered user document to Firestore (`users` collection)
 */
export async function saveUserProfileToFirestore(user: User): Promise<void> {
  if (!isDemoMode && firestore) {
    try {
      await setDoc(
        doc(firestore, 'users', user.uid),
        {
          ...user,
          firestoreUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`[Firestore] User profile recorded in Firestore: ${user.email} (${user.role})`);
    } catch (err) {
      console.warn('[Firestore] Save user profile failed:', err);
    }
  }
}

/**
 * Retrieves a user document from Firestore
 */
export async function getUserProfileFromFirestore(uid: string): Promise<User | null> {
  if (!isDemoMode && firestore) {
    try {
      const snap = await getDoc(doc(firestore, 'users', uid));
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch (err) {
      console.warn(`[Firestore] Get user profile ${uid} failed:`, err);
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// 3. CAMPAIGNS & BRIEFS IN FIRESTORE
// ─────────────────────────────────────────────────────────────

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (!isDemoMode && firestore) {
    try {
      const snap = await getDocs(collection(firestore, 'campaigns'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Campaign);
      }
    } catch (err) {
      console.warn('[Firestore] Fetch campaigns failed:', err);
    }
  }
  return demoCampaigns;
}

export async function saveCampaign(campaign: Campaign): Promise<void> {
  if (isDemoMode || !firestore) {
    const existing = JSON.parse(localStorage.getItem('creovate-campaigns') || '[]');
    localStorage.setItem('creovate-campaigns', JSON.stringify([campaign, ...existing]));
    return;
  }
  await setDoc(doc(firestore, 'campaigns', campaign.id), campaign);
}

export async function removeCampaign(campaignId: string): Promise<void> {
  if (isDemoMode || !firestore) {
    const existing: Campaign[] = JSON.parse(localStorage.getItem('creovate-campaigns') || '[]');
    localStorage.setItem(
      'creovate-campaigns',
      JSON.stringify(existing.filter((c) => c.id !== campaignId))
    );
    return;
  }
  await deleteDoc(doc(firestore, 'campaigns', campaignId));
}

// ─────────────────────────────────────────────────────────────
// 4. INVITATIONS IN FIRESTORE
// ─────────────────────────────────────────────────────────────

export async function saveInvitationToFirestore(invitation: Invitation): Promise<void> {
  if (!isDemoMode && firestore) {
    try {
      await setDoc(doc(firestore, 'invitations', invitation.id), invitation);
    } catch (err) {
      console.warn('[Firestore] Save invitation failed:', err);
    }
  }
}

export async function fetchInvitationsFromFirestore(): Promise<Invitation[]> {
  if (!isDemoMode && firestore) {
    try {
      const snap = await getDocs(collection(firestore, 'invitations'));
      return snap.docs.map((d) => d.data() as Invitation);
    } catch (err) {
      console.warn('[Firestore] Fetch invitations failed:', err);
    }
  }
  return [];
}

// ─────────────────────────────────────────────────────────────
// 5. FIRESTORE HEALTH CHECK & PING TEST
// ─────────────────────────────────────────────────────────────

export async function testFirestoreConnection(): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
}> {
  if (isDemoMode || !firestore) {
    return {
      success: false,
      latencyMs: 0,
      message: 'Running in offline/demo mode. Provide Firebase API Key to connect live Firestore.',
    };
  }

  const startTime = Date.now();
  try {
    const pingRef = doc(firestore, '_system_health', 'ping');
    await setDoc(pingRef, {
      lastPing: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
      platform: 'Creovate AI',
    });
    const latency = Date.now() - startTime;
    return {
      success: true,
      latencyMs: latency,
      message: `Connected successfully to Cloud Firestore in ${latency}ms!`,
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      message: err.message || 'Firestore ping test encountered an error.',
    };
  }
}
