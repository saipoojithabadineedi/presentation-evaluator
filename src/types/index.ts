export type ThemeMode = 'light' | 'dark';

export type AppView = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'evaluation' 
  | 'report' 
  | 'recent-presentations' 
  | 'all-evaluations' 
  | 'reports-archive' 
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  tier: string;
  practiceHours: number;
  totalEvaluations: number;
  averageScore: number;
  averageCadence: number;
  fillerWordRate: number;
}

export interface TranscriptSegment {
  id: string;
  startTime: string; // e.g. "00:15"
  seconds: number;
  speaker: string;
  text: string;
  hasFiller?: boolean;
  fillerWords?: string[];
  wpm: number;
  tone: 'confident' | 'neutral' | 'hesitant' | 'enthusiastic';
}

export interface MetricBreakdown {
  delivery: number; // 0-100
  content: number;  // 0-100
  visuals: number;  // 0-100
  pacing: number;   // 0-100
  clarity: number;  // 0-100
  engagement: number; // 0-100
}

export interface CadenceDataPoint {
  time: string;
  wpm: number;
  targetMin: number;
  targetMax: number;
}

export interface SlideEvaluation {
  slideNumber: number;
  title: string;
  score: number;
  readabilityScore: number;
  visualBalanceScore: number;
  bulletsCount: number;
  suggestions: string[];
}

export interface EvaluationData {
  id: string;
  presentationId: string;
  title: string;
  date: string;
  formattedDate: string;
  duration: string; // e.g. "4 min 32 sec"
  durationSeconds: number;
  fileType: 'video' | 'audio' | 'slides';
  fileSize: string;
  overallScore: number; // e.g. 92
  scoreTier: string; // e.g. "Top 5% speaker tier"
  averageCadence: number; // e.g. 138 WPM
  cadenceStatus: string; // e.g. "Optimal keynote pace (125-150)"
  fillerWordRate: number; // e.g. 0.8%
  fillerWordCount: number;
  fillerBreakdown: {
    um: number;
    like: number;
    uh: number;
    youKnow: number;
    actually: number;
    so: number;
  };
  metrics: MetricBreakdown;
  cadenceTimeline: CadenceDataPoint[];
  strengths: string[];
  improvements: string[];
  transcript: TranscriptSegment[];
  slides?: SlideEvaluation[];
  summary: string;
}

export interface ReportItem {
  id: string;
  evaluationId: string;
  title: string;
  generatedDate: string;
  overallScore: number;
  paceWpm: number;
  fillerRate: number;
  executiveSummary: string;
  downloadCount: number;
}

export interface UserSettings {
  targetMinWpm: number;
  targetMaxWpm: number;
  aiStrictness: 'lenient' | 'standard' | 'rigorous';
  enableFillerAlerts: boolean;
  enableRealtimePacing: boolean;
  speechGoal: 'keynote' | 'pitch' | 'lecture' | 'conference';
  theme: ThemeMode;
}
