import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isDemoMode } from './config';

export async function uploadPortfolioMedia(file: File, path: string): Promise<string> {
  if (isDemoMode || !storage) {
    // Return mock image or object URL for demo mode
    return URL.createObjectURL(file);
  }

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}
