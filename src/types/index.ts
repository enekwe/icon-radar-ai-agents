/**
 * Shared types for AI Agents Service
 */

export interface AgentConfig {
  maxConcurrentJobs: number;
  timeout: number;
  retryAttempts: number;
  cacheTTL: number;
}

export interface AgentExecutionContext {
  jobId: string;
  athleteId?: string;
  brandId?: string;
  userId: string;
  priority: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface AgentExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  confidence?: number;
  metadata?: Record<string, any>;
}

// BrandLink Types
export interface BrandDiscovery {
  athleteId: string;
  athleteName: string;
  brandName: string;
  brandDescription?: string;
  brandWebsite?: string;
  brandCategory?: string;
  relationshipType: 'OWNER' | 'INVESTOR' | 'PARTNER' | 'ENDORSER';
  ownershipPercentage?: number;
  confidence: {
    overall: number;
    sources: Array<{ source: string; score: number }>;
    reasoning: string;
  };
  sources: Array<{
    url: string;
    source: string;
    credibility: number;
    relevantExcerpt: string;
  }>;
  discoveredAt: Date;
}

// BizDataClean Types
export interface VerificationResult {
  brandName: string;
  athleteName: string;
  verificationType: 'ownership' | 'investment' | 'partnership' | 'endorsement';
  confidence: number;
  ownership: {
    type: 'founder' | 'co-founder' | 'investor' | 'unknown';
    title?: string;
    activeRole?: string;
  };
  sources: Array<{
    source: string;
    url: string;
    credibility: number;
    relevantExcerpt: string;
  }>;
  verifiedAt: Date;
  status: 'verified' | 'unverified';
  reasoning: string;
}

// BrandTrend Types
export interface SocialMetrics {
  platform: string;
  brandName: string;
  collectedAt: Date;
  followers: number;
  following?: number;
  posts: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    engagementRate: number;
    avgEngagementPerPost: number;
    engagementTrend: 'rising' | 'falling' | 'stable';
  };
  growth: {
    followerGrowth: GrowthMetrics;
    engagementGrowth: GrowthMetrics;
    contentGrowth: GrowthMetrics;
    overallGrowthRate: number;
  };
  contentAnalysis: {
    totalPosts: number;
    avgPostsPerDay: number;
    avgPostsPerWeek: number;
    topHashtags: string[];
    contentCategories: string[];
    postTypes: Array<{ type: string; count: number }>;
    sentiment: {
      overallScore: number;
      positive: number;
      negative: number;
      neutral: number;
      emotionalTone: string[];
      brandMentionSentiment: number;
    };
  };
}

export interface GrowthMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  trend: 'rising' | 'falling' | 'stable';
  trendStrength: number;
}

// ChampionIndex Types
export interface ScoredBrand {
  brandId: string;
  athleteId: string;
  brandName: string;
  athleteName: string;
  totalScore: number;
  scores: {
    socialScore: number;
    growthScore: number;
    engagementScore: number;
    trafficScore: number;
    sentimentScore: number;
    athleteInfluenceScore?: number;
    verificationScore?: number;
  };
  confidence: number;
  dataQuality: {
    overall: number;
    social: number;
    traffic: number;
    sentiment: number;
    completeness: number;
    recency: number;
  };
  calculatedAt: Date;
  metadata?: Record<string, any>;
}

export interface RankedBrand extends ScoredBrand {
  rank: number;
  previousRank?: number;
  rankChange?: number;
  category: string;
  trend: 'rising' | 'falling' | 'stable';
  trendStrength: number;
  badges?: string[];
}

// Agent Pipeline Types
export interface PipelineExecutionRequest {
  athleteId: string;
  brandId?: string;
  steps: Array<'discovery' | 'verification' | 'metrics' | 'scoring'>;
  priority?: 'low' | 'normal' | 'high';
}

export interface PipelineExecutionResult {
  athleteId: string;
  brandId?: string;
  discovery?: BrandDiscovery[];
  verification?: VerificationResult[];
  metrics?: SocialMetrics[];
  scoring?: ScoredBrand;
  totalExecutionTime: number;
  completedSteps: string[];
  failedSteps: string[];
}

// Job Status Types
export interface JobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  result?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}
