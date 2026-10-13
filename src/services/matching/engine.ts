import type { CreatorProfile } from '../../types/creator';
import type { CampaignBrief } from '../../types/campaign';
import type { MatchScore, MatchResult } from '../../types/matching';

const CATEGORY_RELATIONS: Record<string, string[]> = {
  'AI Video Generation': ['AI Advertising', '3D Art and Animation'],
  'AI Advertising': ['AI Video Generation', 'AI Graphic Design'],
  'AI Photography': ['Product Visualization', 'AI Graphic Design'],
  '3D Art and Animation': ['Product Visualization', 'AI Video Generation', 'AI Avatars'],
  'AI Graphic Design': ['AI Advertising', 'AI Photography'],
  'AI Avatars': ['3D Art and Animation', 'AI-Assisted Creative Development'],
  'Product Visualization': ['3D Art and Animation', 'AI Photography'],
  'AI-Assisted Creative Development': ['AI Advertising', 'AI Graphic Design'],
};

const STYLE_KEYWORDS: Record<string, string[]> = {
  Cinematic: ['cinematic', 'film', 'dramatic', 'movie', 'epic', 'dark', 'moody'],
  Minimalist: ['minimalist', 'clean', 'simple', 'elegant', 'modern', 'subtle'],
  Bold: ['bold', 'vibrant', 'energetic', 'dynamic', 'impactful', 'striking'],
  Playful: ['playful', 'fun', 'colorful', 'creative', 'whimsical', 'quirky'],
  Corporate: ['corporate', 'professional', 'business', 'formal', 'polished'],
  Artistic: ['artistic', 'abstract', 'experimental', 'unique', 'creative', 'avant-garde'],
};

function normalizeString(s: string): string {
  return s.toLowerCase().trim();
}

function calculateSkillScore(
  creatorSkills: string[],
  requiredSkills: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (requiredSkills.length === 0) {
    return { score: 30, matched: [], missing: [] };
  }

  const normalizedCreator = creatorSkills.map(normalizeString);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    const normalizedSkill = normalizeString(skill);
    const isMatch = normalizedCreator.some(
      (cs) =>
        cs.includes(normalizedSkill) ||
        normalizedSkill.includes(cs) ||
        levenshteinSimilarity(cs, normalizedSkill) > 0.7
    );
    if (isMatch) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const ratio = matched.length / requiredSkills.length;
  const score = Math.round(ratio * 30);

  return { score, matched, missing };
}

function calculateCategoryScore(
  creatorCategories: string[],
  requiredCategory: string
): number {
  if (creatorCategories.includes(requiredCategory)) {
    return 25;
  }

  const related = CATEGORY_RELATIONS[requiredCategory] || [];
  const hasRelated = creatorCategories.some((c) => related.includes(c));
  if (hasRelated) {
    return 15;
  }

  return 0;
}

function calculateBudgetScore(
  creatorPriceRange: { min: number; max: number },
  briefBudgetMin: number,
  briefBudgetMax: number
): number {
  // Creator's minimum price is within or below the brief's budget range
  if (creatorPriceRange.min <= briefBudgetMax) {
    if (creatorPriceRange.min <= briefBudgetMin) {
      return 20; // Well within budget
    }
    return 18; // Within budget range
  }

  // Slightly over budget (within 20%)
  const overBy = (creatorPriceRange.min - briefBudgetMax) / briefBudgetMax;
  if (overBy <= 0.2) {
    return 10;
  }
  if (overBy <= 0.5) {
    return 5;
  }

  return 0;
}

function calculateAvailabilityScore(
  availability: string,
  deadline: string,
  availableDate?: string
): number {
  if (availability === 'available') {
    return 15;
  }

  if (availability === 'busy' && availableDate && deadline) {
    const available = new Date(availableDate);
    const deadlineDate = new Date(deadline);
    const diffDays = (deadlineDate.getTime() - available.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 14) return 12;
    if (diffDays > 7) return 8;
    if (diffDays > 0) return 5;
  }

  return 0;
}

function calculateStyleScore(
  creatorStyles: string[],
  creatorBio: string,
  creatorPortfolio: { description: string }[],
  preferredStyle: string
): number {
  if (!preferredStyle) return 5;

  // Direct style match
  if (creatorStyles.some((s) => normalizeString(s) === normalizeString(preferredStyle))) {
    return 10;
  }

  // Check bio and portfolio for style keywords
  const keywords = STYLE_KEYWORDS[preferredStyle] || [];
  const allText = [creatorBio, ...creatorPortfolio.map((p) => p.description)]
    .join(' ')
    .toLowerCase();

  const keywordMatches = keywords.filter((k) => allText.includes(k)).length;
  if (keywordMatches >= 2) return 8;
  if (keywordMatches >= 1) return 5;

  return 2;
}

function levenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return 0;
  if (bLen === 0) return 0;

  for (let i = 0; i <= aLen; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[aLen][bLen];
  return 1 - distance / Math.max(aLen, bLen);
}

function generateExplanations(
  score: MatchScore,
  creator: CreatorProfile,
  brief: CampaignBrief
): { explanation: string[]; warnings: string[] } {
  const explanation: string[] = [];
  const warnings: string[] = [];

  // Category explanation
  if (score.categoryScore === 25) {
    explanation.push(
      `Specializes in ${brief.category} — direct category match.`
    );
  } else if (score.categoryScore === 15) {
    explanation.push(
      `Works in related creative categories with transferable skills.`
    );
  }

  // Skills explanation
  if (score.matchedSkills.length > 0) {
    explanation.push(
      `${score.matchedSkills.length}/${brief.requiredSkills.length} required skills matched: ${score.matchedSkills.join(', ')}.`
    );
  }
  if (score.missingSkills.length > 0) {
    warnings.push(
      `Missing skills: ${score.missingSkills.join(', ')}.`
    );
  }

  // Budget explanation
  if (score.budgetScore >= 18) {
    explanation.push(`Pricing fits within the campaign budget range.`);
  } else if (score.budgetScore >= 10) {
    warnings.push(
      `Slightly above budget — creator starts at ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(creator.priceRange.min)}.`
    );
  } else if (score.budgetScore < 10 && score.budgetScore > 0) {
    warnings.push(
      `Significantly over budget — may require negotiation.`
    );
  }

  // Availability explanation
  if (score.availabilityScore === 15) {
    explanation.push(`Available now and ready to start immediately.`);
  } else if (score.availabilityScore >= 8) {
    explanation.push(
      `Currently busy but available before the deadline${creator.availableDate ? ` (from ${new Date(creator.availableDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})` : ''}.`
    );
  } else if (score.availabilityScore === 0 && creator.availability !== 'available') {
    warnings.push(`Currently ${creator.availability} — may not meet the deadline.`);
  }

  // Style explanation
  if (score.styleScore >= 8) {
    explanation.push(
      `Portfolio style aligns with the "${brief.preferredStyle}" aesthetic.`
    );
  }

  // Portfolio relevance
  if (score.relevantPortfolio.length > 0) {
    explanation.push(
      `Has ${score.relevantPortfolio.length} relevant portfolio project${score.relevantPortfolio.length > 1 ? 's' : ''} in this category.`
    );
  }

  return { explanation, warnings };
}

export function matchCreators(
  creators: CreatorProfile[],
  brief: CampaignBrief
): MatchResult[] {
  const results: MatchResult[] = creators.map((creator) => {
    const skillResult = calculateSkillScore(creator.skills, brief.requiredSkills);
    const categoryScore = calculateCategoryScore(creator.categories, brief.category);
    const budgetScore = calculateBudgetScore(
      creator.priceRange,
      brief.budgetMin,
      brief.budgetMax
    );
    const availabilityScore = calculateAvailabilityScore(
      creator.availability,
      brief.deadline,
      creator.availableDate
    );
    const styleScore = calculateStyleScore(
      creator.preferredStyles,
      creator.biography,
      creator.portfolio,
      brief.preferredStyle
    );

    const overall = Math.min(
      100,
      skillResult.score + categoryScore + budgetScore + availabilityScore + styleScore
    );

    // Find relevant portfolio items
    const relevantPortfolio = creator.portfolio.filter(
      (p) =>
        p.category === brief.category ||
        brief.requiredSkills.some((skill) =>
          p.tools.some(
            (t) =>
              normalizeString(t).includes(normalizeString(skill)) ||
              normalizeString(skill).includes(normalizeString(t))
          )
        )
    );

    const score: MatchScore = {
      overall,
      skillScore: skillResult.score,
      categoryScore,
      budgetScore,
      availabilityScore,
      styleScore,
      matchedSkills: skillResult.matched,
      missingSkills: skillResult.missing,
      relevantPortfolio: relevantPortfolio.slice(0, 3),
      explanation: [],
      warnings: [],
    };

    const { explanation, warnings } = generateExplanations(score, creator, brief);
    score.explanation = explanation;
    score.warnings = warnings;

    return {
      creatorId: creator.uid,
      creatorName: creator.displayName,
      creatorAvatar: creator.avatarUrl,
      creatorHeadline: creator.headline,
      score,
    };
  });

  // Sort by overall score descending
  results.sort((a, b) => b.score.overall - a.score.overall);

  return results;
}
