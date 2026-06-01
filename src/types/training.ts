// ─── Learner ───────────────────────────────────────────────────────────────
export type SeniorityLevel = 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager';
export type GapSeverity = 'low' | 'medium' | 'high';
export type CompletionStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface CompetencyScore {
  topic: string;
  category: string;
  proficiency: number; // 0-4
  gapSeverity: GapSeverity;
  assessedAt: string;
}

export interface Learner {
  id: string;
  name: string;
  role: string;
  department: string;
  seniorityLevel: SeniorityLevel;
  hireDate: string;
  avatarInitials: string;
  competencies: CompetencyScore[];
  activePathId: string | null;
  complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
}

// ─── Learning Path ─────────────────────────────────────────────────────────
export interface LearningPath {
  id: string;
  learnerId: string;
  goal: string;
  modules: TrainingModule[];
  currentModuleIndex: number;
  completionPct: number;
  dueDate: string;
  createdBy: 'system' | 'manager' | 'self';
}

// ─── Content Module ────────────────────────────────────────────────────────
export type ModuleFormat = 'text' | 'slides' | 'video_script' | 'simulation' | 'quiz';
export type ModuleStatus = 'generating' | 'review' | 'approved' | 'published' | 'archived';

export interface TrainingModule {
  id: string;
  title: string;
  topicTags: string[];
  learningObjectives: string[];
  format: ModuleFormat;
  status: ModuleStatus;
  estimatedDurationMin: number;
  readingLevel: number;
  qualityScore: number; // 0-5
  generatedAt: string;
  reviewedBy: string | null;
  version: number;
  completionStatus?: CompletionStatus;
  assessmentScore?: number;
}

// ─── Assessment ────────────────────────────────────────────────────────────
export type QuestionType = 'mcq' | 'scenario' | 'open_ended';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  bloomLevel: BloomLevel;
  question: string;
  options?: string[];
  correctIndex?: number;
  rubric?: string;
  points: number;
}

export interface AssessmentResult {
  id: string;
  learnerId: string;
  moduleId: string;
  score: number; // 0-100
  maxScore: number;
  completedAt: string;
  timeTakenMin: number;
  questionResults: { questionId: string; correct: boolean; points: number }[];
}

// ─── Coaching Session ──────────────────────────────────────────────────────
export type MessageSender = 'learner' | 'agent';
export type CoachingMode = 'qa' | 'simulation' | 'remediation';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  agentThinking?: string;
}

export interface CoachingSession {
  id: string;
  learnerId: string;
  mode: CoachingMode;
  topic: string;
  messages: ChatMessage[];
  startedAt: string;
  isActive: boolean;
}

// ─── Agent Status ──────────────────────────────────────────────────────────
export type AgentStatus = 'idle' | 'working' | 'waiting' | 'error';

export interface AgentState {
  name: string;
  status: AgentStatus;
  currentTask: string;
  tasksCompleted: number;
  tasksQueued: number;
  lastActivity: string;
}

// ─── Analytics ─────────────────────────────────────────────────────────────
export interface CompletionDataPoint {
  week: string;
  completed: number;
  assigned: number;
  rate: number;
}

export interface RetentionDataPoint {
  cohort: string;
  day7: number;
  day30: number;
  day60: number;
}

export interface ComplianceItem {
  requirement: string;
  deadline: string;
  total: number;
  compliant: number;
  atRisk: number;
  nonCompliant: number;
}

// ─── Training Store State ──────────────────────────────────────────────────
export interface TrainingState {
  agents: Record<string, AgentState>;
  learners: Learner[];
  modules: TrainingModule[];
  assessmentResults: AssessmentResult[];
  coachingSession: CoachingSession | null;
  completionData: CompletionDataPoint[];
  retentionData: RetentionDataPoint[];
  complianceItems: ComplianceItem[];
  selectedLearnerId: string | null;
  generationQueue: GenerationJob[];
  eventLog: AgentEvent[];
}

export interface GenerationJob {
  id: string;
  topic: string;
  role: string;
  status: 'queued' | 'generating' | 'review' | 'done';
  progress: number;
  startedAt: string;
  agentStep: string;
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  detail: string;
  level: 'info' | 'success' | 'warning';
}
