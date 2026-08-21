import { EvaluationData, ReportItem, User, UserSettings } from '../types';

export const initialUser: User = {
  id: 'usr-101',
  name: 'User',
  email: 'name@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  tier: 'Top 5% speaker tier',
  practiceHours: 5.4,
  totalEvaluations: 14,
  averageScore: 92,
  averageCadence: 135,
  fillerWordRate: 0.8
};

export const defaultSettings: UserSettings = {
  targetMinWpm: 125,
  targetMaxWpm: 150,
  aiStrictness: 'standard',
  enableFillerAlerts: true,
  enableRealtimePacing: true,
  speechGoal: 'pitch',
  theme: 'light'
};

export const initialEvaluations: EvaluationData[] = [
  {
    id: 'eval-1',
    presentationId: 'pres-1',
    title: 'Q3 Product Strategy Pitch',
    date: 'Yesterday',
    formattedDate: 'Aug 20, 2026 • 2:45 PM',
    duration: '6 min 20 sec',
    durationSeconds: 380,
    fileType: 'video',
    fileSize: '48.2 MB',
    overallScore: 92,
    scoreTier: 'Top 5% speaker tier',
    averageCadence: 138,
    cadenceStatus: 'Optimal keynote pace (125-150)',
    fillerWordRate: 0.8,
    fillerWordCount: 4,
    fillerBreakdown: {
      um: 1,
      like: 2,
      uh: 0,
      youKnow: 1,
      actually: 0,
      so: 0
    },
    metrics: {
      delivery: 94,
      content: 90,
      visuals: 88,
      pacing: 96,
      clarity: 93,
      engagement: 91
    },
    cadenceTimeline: [
      { time: '0:30', wpm: 128, targetMin: 125, targetMax: 150 },
      { time: '1:00', wpm: 134, targetMin: 125, targetMax: 150 },
      { time: '1:30', wpm: 142, targetMin: 125, targetMax: 150 },
      { time: '2:00', wpm: 146, targetMin: 125, targetMax: 150 },
      { time: '2:30', wpm: 139, targetMin: 125, targetMax: 150 },
      { time: '3:00', wpm: 132, targetMin: 125, targetMax: 150 },
      { time: '3:30', wpm: 136, targetMin: 125, targetMax: 150 },
      { time: '4:00', wpm: 141, targetMin: 125, targetMax: 150 },
      { time: '4:30', wpm: 137, targetMin: 125, targetMax: 150 },
      { time: '5:00', wpm: 144, targetMin: 125, targetMax: 150 },
      { time: '5:30', wpm: 138, targetMin: 125, targetMax: 150 },
      { time: '6:00', wpm: 135, targetMin: 125, targetMax: 150 }
    ],
    strengths: [
      'Exceptional rhythmic cadence maintained strictly within the 135–145 WPM sweet spot.',
      'Strong opening hook establishing the Q3 strategic value proposition immediately.',
      'Extremely low filler frequency with only 4 minor conversational fillers across 6+ minutes.',
      'Clear, confident vocal inflection and natural transitions between key milestones.'
    ],
    improvements: [
      'Incorporate a 1.5-second deliberate pause before announcing the projected 42% ROI metric.',
      'Slide 4 visual density: Reduce bullet count from 7 down to 3 high-impact takeaway cards.',
      'Conclusion CTA: Strengthen final closing sentence with direct timeline call-to-action.'
    ],
    transcript: [
      {
        id: 't-1',
        startTime: '00:00',
        seconds: 0,
        speaker: 'John Doe',
        text: 'Good afternoon everyone. Today I am thrilled to present our comprehensive Product Strategy for Q3.',
        wpm: 130,
        tone: 'enthusiastic'
      },
      {
        id: 't-2',
        startTime: '00:18',
        seconds: 18,
        speaker: 'John Doe',
        text: 'Over the last quarter, we conducted deep customer interviews with over 150 enterprise leads, identifying two fundamental market gaps.',
        wpm: 136,
        tone: 'confident'
      },
      {
        id: 't-3',
        startTime: '00:42',
        seconds: 42,
        speaker: 'John Doe',
        text: 'First, workflows are heavily fragmented across multiple disjointed tools, creating, like, significant context-switching friction.',
        hasFiller: true,
        fillerWords: ['like'],
        wpm: 142,
        tone: 'neutral'
      },
      {
        id: 't-4',
        startTime: '01:10',
        seconds: 70,
        speaker: 'John Doe',
        text: 'Our AI-powered workspace solves this directly by unifying presentation analytics, automated delivery feedback, and executive reporting in one place.',
        wpm: 139,
        tone: 'confident'
      },
      {
        id: 't-5',
        startTime: '01:45',
        seconds: 105,
        speaker: 'John Doe',
        text: 'When we piloted this with our beta cohorts, we observed an immediate 38% increase in rehearsal completion rates and unanimous positive sentiment.',
        wpm: 145,
        tone: 'enthusiastic'
      },
      {
        id: 't-6',
        startTime: '02:20',
        seconds: 140,
        speaker: 'John Doe',
        text: 'Looking at our go-to-market timeline, we are scheduled to deploy Phase 1 by mid-September, followed by enterprise API rollouts in October.',
        wpm: 137,
        tone: 'confident'
      }
    ],
    slides: [
      {
        slideNumber: 1,
        title: 'Executive Title & Value Prop',
        score: 95,
        readabilityScore: 98,
        visualBalanceScore: 92,
        bulletsCount: 2,
        suggestions: ['Great clean hierarchy with prominent brand gradient.']
      },
      {
        slideNumber: 2,
        title: 'Market Opportunity & Problem Statement',
        score: 91,
        readabilityScore: 90,
        visualBalanceScore: 92,
        bulletsCount: 3,
        suggestions: ['Strong contrast ratio. Clear 2-column layout.']
      },
      {
        slideNumber: 3,
        title: 'Product Architecture & AI Engine',
        score: 88,
        readabilityScore: 86,
        visualBalanceScore: 90,
        bulletsCount: 4,
        suggestions: ['Consider adding a callout arrow to the feedback loop node.']
      }
    ],
    summary: 'An outstanding, highly polished executive presentation. Pacing was exemplary throughout, and arguments were structured with clarity and conviction.'
  },
  {
    id: 'eval-2',
    presentationId: 'pres-2',
    title: 'AI Pitch Deck Keynote',
    date: '3 days ago',
    formattedDate: 'Aug 18, 2026 • 11:15 AM',
    duration: '4 min 50 sec',
    durationSeconds: 290,
    fileType: 'video',
    fileSize: '35.6 MB',
    overallScore: 87,
    scoreTier: 'Top 10% speaker tier',
    averageCadence: 132,
    cadenceStatus: 'Optimal keynote pace (125-150)',
    fillerWordRate: 1.4,
    fillerWordCount: 7,
    fillerBreakdown: {
      um: 3,
      like: 2,
      uh: 1,
      youKnow: 1,
      actually: 0,
      so: 0
    },
    metrics: {
      delivery: 88,
      content: 89,
      visuals: 85,
      pacing: 90,
      clarity: 86,
      engagement: 84
    },
    cadenceTimeline: [
      { time: '0:30', wpm: 120, targetMin: 125, targetMax: 150 },
      { time: '1:00', wpm: 130, targetMin: 125, targetMax: 150 },
      { time: '1:30', wpm: 138, targetMin: 125, targetMax: 150 },
      { time: '2:00', wpm: 135, targetMin: 125, targetMax: 150 },
      { time: '2:30', wpm: 131, targetMin: 125, targetMax: 150 },
      { time: '3:00', wpm: 129, targetMin: 125, targetMax: 150 },
      { time: '3:30', wpm: 136, targetMin: 125, targetMax: 150 },
      { time: '4:00', wpm: 134, targetMin: 125, targetMax: 150 }
    ],
    strengths: [
      'Captivating opening story demonstrating the core AI capability.',
      'Clear, accessible terminology without unnecessary technical jargon.',
      'Consistent volume and vocal energy.'
    ],
    improvements: [
      'Reduce hesitation pauses during the competitive landscape comparison.',
      'Watch out for repeated "um" filler words when transitioning between slides 3 and 4.',
      'Make financial projections slide simpler by spotlighting the MRR growth curve.'
    ],
    transcript: [
      {
        id: 't-21',
        startTime: '00:00',
        seconds: 0,
        speaker: 'John Doe',
        text: 'Welcome investors. In the next five minutes, I will show you how presentation coaching is being revolutionized by AI.',
        wpm: 125,
        tone: 'confident'
      },
      {
        id: 't-22',
        startTime: '00:24',
        seconds: 24,
        speaker: 'John Doe',
        text: 'Every professional spends hours rehearsing, yet 74% suffer from speech anxiety and pacing issues without objective feedback.',
        wpm: 134,
        tone: 'enthusiastic'
      },
      {
        id: 't-23',
        startTime: '00:55',
        seconds: 55,
        speaker: 'John Doe',
        text: 'Our platform gives instantaneous, scientifically validated metrics on cadence, tone, and visual structure.',
        wpm: 136,
        tone: 'confident'
      }
    ],
    summary: 'A compelling pitch delivery with solid cadence. Minor adjustments to filler word management will elevate this to top-tier keynote quality.'
  },
  {
    id: 'eval-3',
    presentationId: 'pres-3',
    title: 'Series A Investor Rehearsal',
    date: '1 week ago',
    formattedDate: 'Aug 14, 2026 • 4:00 PM',
    duration: '8 min 12 sec',
    durationSeconds: 492,
    fileType: 'slides',
    fileSize: '12.4 MB',
    overallScore: 94,
    scoreTier: 'Top 3% speaker tier',
    averageCadence: 141,
    cadenceStatus: 'Optimal keynote pace (125-150)',
    fillerWordRate: 0.5,
    fillerWordCount: 3,
    fillerBreakdown: {
      um: 1,
      like: 1,
      uh: 0,
      youKnow: 0,
      actually: 1,
      so: 0
    },
    metrics: {
      delivery: 96,
      content: 95,
      visuals: 92,
      pacing: 97,
      clarity: 95,
      engagement: 93
    },
    cadenceTimeline: [
      { time: '1:00', wpm: 135, targetMin: 125, targetMax: 150 },
      { time: '2:00', wpm: 142, targetMin: 125, targetMax: 150 },
      { time: '3:00', wpm: 145, targetMin: 125, targetMax: 150 },
      { time: '4:00', wpm: 140, targetMin: 125, targetMax: 150 },
      { time: '5:00', wpm: 138, targetMin: 125, targetMax: 150 },
      { time: '6:00', wpm: 143, targetMin: 125, targetMax: 150 },
      { time: '7:00', wpm: 141, targetMin: 125, targetMax: 150 },
      { time: '8:00', wpm: 139, targetMin: 125, targetMax: 150 }
    ],
    strengths: [
      'Masterclass in unit economics storytelling and defensibility presentation.',
      'Nearly zero filler words across an extensive 8-minute delivery.',
      'Clear vocal emphasis on traction milestones and 3x MoM growth.'
    ],
    improvements: [
      'Ensure the ask slide gives a clear breakdown of fund allocation percentages.'
    ],
    transcript: [],
    summary: 'Exceptional executive presence and pitch pacing. Ready for top-tier venture investor meetings.'
  }
];

export const initialReports: ReportItem[] = [
  {
    id: 'rep-1',
    evaluationId: 'eval-1',
    title: 'Q3 Product Strategy Pitch - Executive Report',
    generatedDate: 'Aug 20, 2026',
    overallScore: 92,
    paceWpm: 138,
    fillerRate: 0.8,
    executiveSummary: 'Speech delivery scored in the top 5th percentile with exceptional pacing and zero structural impediments.',
    downloadCount: 3
  },
  {
    id: 'rep-2',
    evaluationId: 'eval-2',
    title: 'AI Pitch Deck Keynote - Evaluation Report',
    generatedDate: 'Aug 18, 2026',
    overallScore: 87,
    paceWpm: 132,
    fillerRate: 1.4,
    executiveSummary: 'Strong delivery and clear value proposition. Minor pacing recommendations noted for slide transitions.',
    downloadCount: 1
  },
  {
    id: 'rep-3',
    evaluationId: 'eval-3',
    title: 'Series A Investor Rehearsal - Comprehensive Report',
    generatedDate: 'Aug 14, 2026',
    overallScore: 94,
    paceWpm: 141,
    fillerRate: 0.5,
    executiveSummary: 'Near-perfect keynote delivery with high engagement, crisp vocal clarity, and compelling traction metrics.',
    downloadCount: 5
  }
];
