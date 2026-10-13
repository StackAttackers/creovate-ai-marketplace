import { useState, useEffect, useCallback } from 'react';
import {
  getStoredShortlist,
  saveStoredShortlist,
  DATA_EVENTS,
} from '../services/store/dataStore';

export function useShortlist() {
  const [shortlist, setShortlist] = useState<string[]>(() => getStoredShortlist());

  useEffect(() => {
    const handleUpdate = () => {
      setShortlist(getStoredShortlist());
    };
    window.addEventListener(DATA_EVENTS.SHORTLIST_UPDATED, handleUpdate);
    return () => window.removeEventListener(DATA_EVENTS.SHORTLIST_UPDATED, handleUpdate);
  }, []);

  const addToShortlist = useCallback((creatorId: string) => {
    setShortlist((prev) => {
      if (prev.includes(creatorId)) return prev;
      const updated = [...prev, creatorId];
      saveStoredShortlist(updated);
      return updated;
    });
  }, []);

  const removeFromShortlist = useCallback((creatorId: string) => {
    setShortlist((prev) => {
      const updated = prev.filter((id) => id !== creatorId);
      saveStoredShortlist(updated);
      return updated;
    });
  }, []);

  const isShortlisted = useCallback(
    (creatorId: string): boolean => {
      return shortlist.includes(creatorId);
    },
    [shortlist]
  );

  const toggleShortlist = useCallback(
    (creatorId: string) => {
      if (isShortlisted(creatorId)) {
        removeFromShortlist(creatorId);
      } else {
        addToShortlist(creatorId);
      }
    },
    [isShortlisted, addToShortlist, removeFromShortlist]
  );

  return {
    shortlist,
    addToShortlist,
    removeFromShortlist,
    isShortlisted,
    toggleShortlist,
  };
}
