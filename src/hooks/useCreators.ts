import { useState, useEffect, useCallback } from 'react';
import {
  getStoredCreators,
  saveCreatorProfile,
  addPortfolioItemToCreator,
  DATA_EVENTS,
} from '../services/store/dataStore';
import type { CreatorProfile, CreatorFilters, PortfolioItem } from '../types/creator';

export function useCreators() {
  const [creators, setCreators] = useState<CreatorProfile[]>(() => getStoredCreators());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCreators(getStoredCreators());
    };
    window.addEventListener(DATA_EVENTS.CREATORS_UPDATED, handleUpdate);
    return () => window.removeEventListener(DATA_EVENTS.CREATORS_UPDATED, handleUpdate);
  }, []);

  const updateCreator = useCallback((profile: CreatorProfile) => {
    setIsLoading(true);
    saveCreatorProfile(profile);
    setCreators(getStoredCreators());
    setIsLoading(false);
  }, []);

  const addPortfolio = useCallback((creatorId: string, item: PortfolioItem) => {
    setIsLoading(true);
    addPortfolioItemToCreator(creatorId, item);
    setCreators(getStoredCreators());
    setIsLoading(false);
  }, []);

  const filterCreators = useCallback(
    (filters: CreatorFilters): CreatorProfile[] => {
      let result = [...creators];

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(
          (c) =>
            c.displayName.toLowerCase().includes(searchLower) ||
            c.headline.toLowerCase().includes(searchLower) ||
            c.skills.some((s) => s.toLowerCase().includes(searchLower)) ||
            c.categories.some((cat) => cat.toLowerCase().includes(searchLower)) ||
            c.tools.some((t) => t.toLowerCase().includes(searchLower))
        );
      }

      // Category filter
      if (filters.category) {
        result = result.filter((c) => c.categories.includes(filters.category as any));
      }

      // Content type filter
      if (filters.contentType && filters.contentType !== 'All') {
        const ct = filters.contentType.toLowerCase();
        result = result.filter((c) =>
          c.portfolio.some(
            (p) =>
              (p.contentType && p.contentType.toLowerCase().includes(ct)) ||
              (p.category && p.category.toLowerCase().includes(ct))
          )
        );
      }

      // Budget filter
      if (filters.budgetMax < 500000) {
        result = result.filter((c) => c.priceRange.min <= filters.budgetMax);
      }

      // Availability filter
      if (filters.availability) {
        result = result.filter((c) => c.availability === filters.availability);
      }

      // Verified filter
      if (filters.verifiedOnly) {
        result = result.filter((c) => c.verified === true);
      }

      // Sort
      switch (filters.sortBy) {
        case 'featured':
          result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
        case 'price-low':
          result.sort((a, b) => a.priceRange.min - b.priceRange.min);
          break;
        case 'price-high':
          result.sort((a, b) => b.priceRange.max - a.priceRange.max);
          break;
        case 'relevance':
        default:
          result.sort((a, b) => {
            if (a.featured !== b.featured) return b.featured ? 1 : -1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          break;
      }

      return result;
    },
    [creators]
  );

  const getCreatorById = useCallback(
    (id: string): CreatorProfile | undefined => {
      return creators.find((c) => c.uid === id);
    },
    [creators]
  );

  return {
    creators,
    isLoading,
    updateCreator,
    addPortfolio,
    filterCreators,
    getCreatorById,
  };
}
