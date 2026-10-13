import { useState, useEffect, useCallback } from 'react';
import {
  getStoredCampaigns,
  saveCampaign,
  deleteStoredCampaign,
  DATA_EVENTS,
} from '../services/store/dataStore';
import type { Campaign, CampaignBrief } from '../types/campaign';
import { generateId } from '../utils/format';
import { useAuth } from './useAuth';

export function useCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getStoredCampaigns());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCampaigns(getStoredCampaigns());
    };
    window.addEventListener(DATA_EVENTS.CAMPAIGNS_UPDATED, handleUpdate);
    return () => window.removeEventListener(DATA_EVENTS.CAMPAIGNS_UPDATED, handleUpdate);
  }, []);

  const getCampaignsByBrand = useCallback(
    (brandId: string): Campaign[] => {
      return campaigns.filter((c) => c.brandId === brandId);
    },
    [campaigns]
  );

  const getPublishedCampaigns = useCallback((): Campaign[] => {
    return campaigns.filter((c) => c.status === 'published');
  }, [campaigns]);

  const getCampaignById = useCallback(
    (id: string): Campaign | undefined => {
      return campaigns.find((c) => c.id === id);
    },
    [campaigns]
  );

  const createCampaign = useCallback(
    (brief: CampaignBrief): Campaign => {
      setIsLoading(true);
      const newCampaign: Campaign = {
        id: `campaign-${generateId()}`,
        brandId: user?.uid || 'brand-active-user',
        brandName: user?.displayName || 'Active Brand Studio',
        ...brief,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveCampaign(newCampaign);
      setCampaigns(getStoredCampaigns());
      setIsLoading(false);
      return newCampaign;
    },
    [user]
  );

  const updateCampaignStatus = useCallback(
    (campaignId: string, status: Campaign['status']) => {
      const target = campaigns.find((c) => c.id === campaignId);
      if (target) {
        saveCampaign({
          ...target,
          status,
          updatedAt: new Date().toISOString(),
        });
        setCampaigns(getStoredCampaigns());
      }
    },
    [campaigns]
  );

  const deleteCampaign = useCallback((campaignId: string) => {
    deleteStoredCampaign(campaignId);
    setCampaigns(getStoredCampaigns());
  }, []);

  return {
    campaigns,
    isLoading,
    getCampaignsByBrand,
    getPublishedCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaignStatus,
    deleteCampaign,
  };
}
