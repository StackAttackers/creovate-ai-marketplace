import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, isDemoMode } from './config';
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from './firestore';
import type { User, UserRole } from '../../types/user';

export async function loginUser(email: string, password: string): Promise<User | null> {
  if (isDemoMode || !auth) {
    const usersStore = JSON.parse(localStorage.getItem('creovate-users') || '{}');
    const user = usersStore[email];
    if (!user) throw new Error('No user account found with this email. Please sign up first.');
    return user;
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  
  // Try to retrieve user profile doc from Firestore
  const firestoreUser = await getUserProfileFromFirestore(credential.user.uid);
  if (firestoreUser) {
    return firestoreUser;
  }

  // Fallback if not found in Firestore yet
  return {
    uid: credential.user.uid,
    email: credential.user.email || '',
    displayName: credential.user.displayName || 'User',
    role: 'creator',
    createdAt: new Date().toISOString(),
  };
}

export async function registerUser(
  email: string,
  password: string,
  role: UserRole,
  displayName: string
): Promise<User> {
  if (isDemoMode || !auth) {
    const user: User = {
      uid: `user-${Date.now()}`,
      email,
      role,
      displayName,
      createdAt: new Date().toISOString(),
    };
    const usersStore = JSON.parse(localStorage.getItem('creovate-users') || '{}');
    usersStore[email] = user;
    localStorage.setItem('creovate-users', JSON.stringify(usersStore));
    return user;
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const newUser: User = {
    uid: credential.user.uid,
    email: credential.user.email || '',
    displayName,
    role,
    createdAt: new Date().toISOString(),
  };

  // Persist user record in Cloud Firestore `users` collection
  await saveUserProfileToFirestore(newUser);

  return newUser;
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}
