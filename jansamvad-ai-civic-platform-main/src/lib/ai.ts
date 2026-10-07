import type { AIAnalysis, Priority } from './types';

export interface EnhancedAIAnalysis extends AIAnalysis {
  severity: number;
  summary: string;
  suggestedAction: string;
}

interface KeywordRule {
  keywords: string[];
  category: string;
  department: string;
  priority: Priority;
  confidence: number;
  severity: number;
  summaryTemplate: string;
  suggestedAction: string;
}

const RULES: KeywordRule[] = [
  {
    keywords: ['garbage', 'waste', 'trash', 'dustbin', 'rubbish', 'litter', 'bin', 'sweeper'],
    category: 'Waste Management',
    department: 'Solid Waste Management',
    priority: 'High',
    confidence: 94,
    severity: 82,
    summaryTemplate: 'Garbage accumulation reported in a public area requiring immediate cleanup.',
    suggestedAction: 'Assign sanitation staff for inspection and cleanup within 24 hours.',
  },
  {
    keywords: ['pothole', 'road', 'broken road', 'crack', 'asphalt', 'pavement', 'footpath'],
    category: 'Road Damage',
    department: 'Public Works Department',
    priority: 'High',
    confidence: 91,
    severity: 78,
    summaryTemplate: 'Road surface damage detected that may pose risk to commuters.',
    suggestedAction: 'Dispatch road repair team to assess and fill potholes within 48 hours.',
  },
  {
    keywords: ['street light', 'light not working', 'lamp', 'streetlight', 'dark', 'illumination'],
    category: 'Street Lighting',
    department: 'Electrical Department',
    priority: 'Medium',
    confidence: 93,
    severity: 55,
    summaryTemplate: 'Street lighting malfunction reported affecting area visibility and safety.',
    suggestedAction: 'Assign electrician to inspect and repair street lighting fixture.',
  },
  {
    keywords: ['water leakage', 'water pipe', 'water supply', 'tap', 'drainage', 'sewage', 'overflow', 'leak'],
    category: 'Water Supply',
    department: 'Water Supply Department',
    priority: 'High',
    confidence: 95,
    severity: 85,
    summaryTemplate: 'Water leakage or supply issue detected requiring urgent attention.',
    suggestedAction: 'Dispatch water supply team to repair leakage and restore supply.',
  },
  {
    keywords: ['sewage', 'drain', 'gutter', 'sanitation', 'toilet', 'unclean', 'foul', 'smell'],
    category: 'Sanitation',
    department: 'Sanitation Department',
    priority: 'High',
    confidence: 90,
    severity: 80,
    summaryTemplate: 'Sanitation issue reported posing potential public health risk.',
    suggestedAction: 'Assign sanitation team for immediate cleaning and disinfection.',
  },
  {
    keywords: ['tree', 'branch', 'fallen', 'garden', 'park', 'uprooted'],
    category: 'Tree & Garden',
    department: 'Garden Department',
    priority: 'Medium',
    confidence: 88,
    severity: 50,
    summaryTemplate: 'Tree or garden maintenance issue reported in public area.',
    suggestedAction: 'Assign garden department team for tree trimming or maintenance.',
  },
  {
    keywords: ['encroachment', 'illegal', 'hawker', 'vendor', 'occupation'],
    category: 'Encroachment',
    department: 'Encroachment Department',
    priority: 'Medium',
    confidence: 86,
    severity: 60,
    summaryTemplate: 'Illegal encroachment reported on public property or pathway.',
    suggestedAction: 'Assign encroachment removal team for verification and action.',
  },
  {
    keywords: ['dog', 'animal', 'stray', 'monkey', 'snake'],
    category: 'Animal Nuisance',
    department: 'Animal Control',
    priority: 'Low',
    confidence: 82,
    severity: 40,
    summaryTemplate: 'Animal nuisance reported in residential or public area.',
    suggestedAction: 'Assign animal control team for safe capture or relocation.',
  },
];

const DEFAULT_ANALYSIS: KeywordRule = {
  keywords: [],
  category: 'General Civic Issue',
  department: 'General Administration',
  priority: 'Medium',
  confidence: 72,
  severity: 45,
  summaryTemplate: 'A general civic issue has been reported requiring departmental review.',
  suggestedAction: 'Forward to general administration for category assessment and assignment.',
};

export function analyzeComplaint(text: string): AIAnalysis {
  const enhanced = analyzeComplaintEnhanced(text);
  return {
    category: enhanced.category,
    department: enhanced.department,
    priority: enhanced.priority,
    confidence: enhanced.confidence,
  };
}

export function analyzeComplaintEnhanced(text: string): EnhancedAIAnalysis {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      const jitter = Math.floor(Math.random() * 4) - 2;
      const sevJitter = Math.floor(Math.random() * 6) - 3;
      return {
        category: rule.category,
        department: rule.department,
        priority: rule.priority,
        confidence: Math.max(80, Math.min(99, rule.confidence + jitter)),
        severity: Math.max(20, Math.min(100, rule.severity + sevJitter)),
        summary: rule.summaryTemplate,
        suggestedAction: rule.suggestedAction,
      };
    }
  }
  return {
    category: DEFAULT_ANALYSIS.category,
    department: DEFAULT_ANALYSIS.department,
    priority: DEFAULT_ANALYSIS.priority,
    confidence: DEFAULT_ANALYSIS.confidence,
    severity: DEFAULT_ANALYSIS.severity,
    summary: DEFAULT_ANALYSIS.summaryTemplate,
    suggestedAction: DEFAULT_ANALYSIS.suggestedAction,
  };
}

export const CATEGORY_LIST = [
  'Waste Management',
  'Road Damage',
  'Street Lighting',
  'Water Supply',
  'Sanitation',
  'Tree & Garden',
  'Encroachment',
  'Animal Nuisance',
  'General Civic Issue',
];
