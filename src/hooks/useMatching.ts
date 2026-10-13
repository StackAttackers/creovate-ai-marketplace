import { useState, useCallback } from 'react';
import { useCreators } from './useCreators';
import { matchCreators } from '../services/matching/engine';
import type { CampaignBrief } from '../types/campaign';
import type { MatchResult } from '../types/matching';

export function useMatching() {
  const { creators } = useCreators();
  const [isMatching, setIsMatching] = useState(false);
  const [matchStep, setMatchStep] = useState(0);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const runMatching = useCallback(
    async (brief: CampaignBrief): Promise<MatchResult[]> => {
      setIsMatching(true);
      setMatchStep(0);
      setResults(null);

      // Simulate multi-vector deterministic algorithm steps
      for (let step = 0; step < 4; step++) {
        setMatchStep(step);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      const calculatedResults = matchCreators(creators, brief);
      setResults(calculatedResults);
      setIsMatching(false);
      return calculatedResults;
    },
    [creators]
  );

  const resetMatching = useCallback(() => {
    setResults(null);
    setIsMatching(false);
    setMatchStep(0);
  }, []);

  return {
    isMatching,
    matchStep,
    results,
    runMatching,
    resetMatching,
  };
}
