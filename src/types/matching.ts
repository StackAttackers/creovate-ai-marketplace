import type { PortfolioItem } from './creator';

export interface MatchScore {
  overall: number;
  skillScore: number;
  categoryScore: number;
  budgetScore: number;
  availabilityScore: number;
  styleScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  relevantPortfolio: PortfolioItem[];
  explanation: string[];
  warnings: string[];
}

export interface MatchResult {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHeadline: string;
  score: MatchScore;
}
