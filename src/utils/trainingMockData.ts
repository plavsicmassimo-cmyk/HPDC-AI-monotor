import type {
  Learner, TrainingModule, AssessmentResult, CompletionDataPoint,
  RetentionDataPoint, ComplianceItem, GenerationJob, AgentEvent, AgentState,
} from '../types/training';

export function buildInitialAgents(): Record<string, AgentState> {
  return {
    conductor: {
      name: 'Conductor Agent',
      status: 'working',
      currentTask: 'Orchestrating onboarding path for 3 new hires',
      tasksCompleted: 142,
      tasksQueued: 7,
      lastActivity: new Date().toISOString(),
    },
    diagnosis: {
      name: 'Diagnosis Agent',
      status: 'working',
      currentTask: 'Running adaptive diagnostic for Maria Santos',
      tasksCompleted: 89,
      tasksQueued: 3,
      lastActivity: new Date().toISOString(),
    },
    content: {
      name: 'Content Generator',
      status: 'working',
      currentTask: 'Generating "HPDC Safety Fundamentals" module',
      tasksCompleted: 214,
      tasksQueued: 5,
      lastActivity: new Date().toISOString(),
    },
    assessment: {
      name: 'Assessment Agent',
      status: 'idle',
      currentTask: 'Waiting for module approvals',
      tasksCompleted: 178,
      tasksQueued: 0,
      lastActivity: new Date(Date.now() - 4 * 60000).toISOString(),
    },
    coaching: {
      name: 'Coaching Agent',
      status: 'working',
      currentTask: 'Active coaching session with James Okafor',
      tasksCompleted: 93,
      tasksQueued: 1,
      lastActivity: new Date().toISOString(),
    },
    analytics: {
      name: 'Analytics Agent',
      status: 'idle',
      currentTask: 'Weekly cohort report generation scheduled',
      tasksCompleted: 61,
      tasksQueued: 0,
      lastActivity: new Date(Date.now() - 12 * 60000).toISOString(),
    },
  };
}

export function buildLearners(): Learner[] {
  return [
    {
      id: 'l1',
      name: 'Maria Santos',
      role: 'Process Engineer',
      department: 'Manufacturing',
      seniorityLevel: 'Junior',
      hireDate: '2026-05-15',
      avatarInitials: 'MS',
      complianceStatus: 'at_risk',
      activePathId: 'path1',
      competencies: [
        { topic: 'Injection Parameters', category: 'Technical', proficiency: 1, gapSeverity: 'high', assessedAt: '2026-05-28' },
        { topic: 'Die Thermal Management', category: 'Technical', proficiency: 2, gapSeverity: 'medium', assessedAt: '2026-05-28' },
        { topic: 'Safety Protocols', category: 'Compliance', proficiency: 1, gapSeverity: 'high', assessedAt: '2026-05-28' },
        { topic: 'Quality Inspection', category: 'Quality', proficiency: 2, gapSeverity: 'medium', assessedAt: '2026-05-28' },
        { topic: 'Machine Operation', category: 'Technical', proficiency: 3, gapSeverity: 'low', assessedAt: '2026-05-28' },
        { topic: 'Alloy Metallurgy', category: 'Technical', proficiency: 1, gapSeverity: 'high', assessedAt: '2026-05-28' },
      ],
    },
    {
      id: 'l2',
      name: 'James Okafor',
      role: 'Quality Technician',
      department: 'Quality',
      seniorityLevel: 'Mid',
      hireDate: '2025-11-10',
      avatarInitials: 'JO',
      complianceStatus: 'compliant',
      activePathId: 'path2',
      competencies: [
        { topic: 'Injection Parameters', category: 'Technical', proficiency: 3, gapSeverity: 'low', assessedAt: '2026-04-10' },
        { topic: 'Die Thermal Management', category: 'Technical', proficiency: 2, gapSeverity: 'medium', assessedAt: '2026-04-10' },
        { topic: 'Safety Protocols', category: 'Compliance', proficiency: 4, gapSeverity: 'low', assessedAt: '2026-04-10' },
        { topic: 'Quality Inspection', category: 'Quality', proficiency: 4, gapSeverity: 'low', assessedAt: '2026-04-10' },
        { topic: 'Machine Operation', category: 'Technical', proficiency: 3, gapSeverity: 'low', assessedAt: '2026-04-10' },
        { topic: 'Alloy Metallurgy', category: 'Technical', proficiency: 2, gapSeverity: 'medium', assessedAt: '2026-04-10' },
      ],
    },
    {
      id: 'l3',
      name: 'Sophie Müller',
      role: 'Maintenance Engineer',
      department: 'Maintenance',
      seniorityLevel: 'Senior',
      hireDate: '2023-03-01',
      avatarInitials: 'SM',
      complianceStatus: 'compliant',
      activePathId: null,
      competencies: [
        { topic: 'Injection Parameters', category: 'Technical', proficiency: 4, gapSeverity: 'low', assessedAt: '2026-03-15' },
        { topic: 'Die Thermal Management', category: 'Technical', proficiency: 4, gapSeverity: 'low', assessedAt: '2026-03-15' },
        { topic: 'Safety Protocols', category: 'Compliance', proficiency: 4, gapSeverity: 'low', assessedAt: '2026-03-15' },
        { topic: 'Quality Inspection', category: 'Quality', proficiency: 3, gapSeverity: 'low', assessedAt: '2026-03-15' },
        { topic: 'Machine Operation', category: 'Technical', proficiency: 4, gapSeverity: 'low', assessedAt: '2026-03-15' },
        { topic: 'Alloy Metallurgy', category: 'Technical', proficiency: 3, gapSeverity: 'low', assessedAt: '2026-03-15' },
      ],
    },
    {
      id: 'l4',
      name: 'Luca Ferretti',
      role: 'Die Casting Operator',
      department: 'Manufacturing',
      seniorityLevel: 'Junior',
      hireDate: '2026-05-28',
      avatarInitials: 'LF',
      complianceStatus: 'non_compliant',
      activePathId: 'path3',
      competencies: [
        { topic: 'Injection Parameters', category: 'Technical', proficiency: 0, gapSeverity: 'high', assessedAt: '2026-05-30' },
        { topic: 'Die Thermal Management', category: 'Technical', proficiency: 0, gapSeverity: 'high', assessedAt: '2026-05-30' },
        { topic: 'Safety Protocols', category: 'Compliance', proficiency: 1, gapSeverity: 'high', assessedAt: '2026-05-30' },
        { topic: 'Quality Inspection', category: 'Quality', proficiency: 1, gapSeverity: 'high', assessedAt: '2026-05-30' },
        { topic: 'Machine Operation', category: 'Technical', proficiency: 1, gapSeverity: 'high', assessedAt: '2026-05-30' },
        { topic: 'Alloy Metallurgy', category: 'Technical', proficiency: 0, gapSeverity: 'high', assessedAt: '2026-05-30' },
      ],
    },
  ];
}

export function buildModules(): TrainingModule[] {
  return [
    {
      id: 'm1', title: 'HPDC Fundamentals & Safety', topicTags: ['Safety', 'Fundamentals'],
      learningObjectives: ['Identify key HPDC process stages', 'Apply lockout/tagout procedures', 'Recognize common hazards'],
      format: 'text', status: 'published', estimatedDurationMin: 45, readingLevel: 11.2, qualityScore: 4.6,
      generatedAt: '2026-05-20T09:00:00Z', reviewedBy: 'Sophie Müller', version: 2,
      completionStatus: 'completed', assessmentScore: 88,
    },
    {
      id: 'm2', title: 'Injection Phase Control', topicTags: ['Technical', 'Injection'],
      learningObjectives: ['Configure phase 1/2 velocity setpoints', 'Interpret plunger trace charts', 'Diagnose injection defects'],
      format: 'slides', status: 'published', estimatedDurationMin: 60, readingLevel: 12.1, qualityScore: 4.8,
      generatedAt: '2026-05-22T14:00:00Z', reviewedBy: 'Sophie Müller', version: 1,
      completionStatus: 'in_progress', assessmentScore: undefined,
    },
    {
      id: 'm3', title: 'Die Thermal Management', topicTags: ['Technical', 'Thermal'],
      learningObjectives: ['Monitor zone temperatures', 'Adjust cooling circuit flow rates', 'Prevent thermal fatigue'],
      format: 'text', status: 'review', estimatedDurationMin: 50, readingLevel: 11.8, qualityScore: 4.3,
      generatedAt: '2026-05-30T11:00:00Z', reviewedBy: null, version: 1,
      completionStatus: 'not_started',
    },
    {
      id: 'm4', title: 'Alloy Metallurgy for Operators', topicTags: ['Metallurgy', 'Technical'],
      learningObjectives: ['Identify A380 alloy properties', 'Interpret superheat requirements', 'Recognize metal contamination'],
      format: 'video_script', status: 'generating', estimatedDurationMin: 35, readingLevel: 10.5, qualityScore: 0,
      generatedAt: '2026-06-01T08:30:00Z', reviewedBy: null, version: 1,
      completionStatus: 'not_started',
    },
    {
      id: 'm5', title: 'Quality Inspection Techniques', topicTags: ['Quality', 'Inspection'],
      learningObjectives: ['Perform visual defect classification', 'Use dimensional inspection tools', 'Document non-conformances'],
      format: 'simulation', status: 'published', estimatedDurationMin: 55, readingLevel: 11.0, qualityScore: 4.7,
      generatedAt: '2026-05-18T10:00:00Z', reviewedBy: 'James Okafor', version: 3,
      completionStatus: 'completed', assessmentScore: 92,
    },
    {
      id: 'm6', title: 'OSHA Compliance & Reporting', topicTags: ['Compliance', 'Safety'],
      learningObjectives: ['Complete incident reports accurately', 'Understand OSHA recordability criteria', 'Conduct safety walkthroughs'],
      format: 'text', status: 'approved', estimatedDurationMin: 40, readingLevel: 10.8, qualityScore: 4.5,
      generatedAt: '2026-05-25T16:00:00Z', reviewedBy: 'HR Team', version: 1,
      completionStatus: 'not_started',
    },
  ];
}

export function buildAssessmentResults(): AssessmentResult[] {
  return [
    {
      id: 'r1', learnerId: 'l1', moduleId: 'm1', score: 88, maxScore: 100,
      completedAt: '2026-05-25T11:30:00Z', timeTakenMin: 22,
      questionResults: [
        { questionId: 'q1', correct: true, points: 10 },
        { questionId: 'q2', correct: true, points: 10 },
        { questionId: 'q3', correct: false, points: 0 },
        { questionId: 'q4', correct: true, points: 10 },
        { questionId: 'q5', correct: true, points: 8 },
      ],
    },
    {
      id: 'r2', learnerId: 'l2', moduleId: 'm5', score: 92, maxScore: 100,
      completedAt: '2026-05-20T15:00:00Z', timeTakenMin: 18,
      questionResults: [
        { questionId: 'q1', correct: true, points: 10 },
        { questionId: 'q2', correct: true, points: 10 },
        { questionId: 'q3', correct: true, points: 10 },
        { questionId: 'q4', correct: false, points: 0 },
        { questionId: 'q5', correct: true, points: 10 },
      ],
    },
  ];
}

export function buildCompletionData(): CompletionDataPoint[] {
  return [
    { week: 'W1', completed: 12, assigned: 18, rate: 67 },
    { week: 'W2', completed: 15, assigned: 19, rate: 79 },
    { week: 'W3', completed: 18, assigned: 21, rate: 86 },
    { week: 'W4', completed: 20, assigned: 22, rate: 91 },
    { week: 'W5', completed: 17, assigned: 20, rate: 85 },
    { week: 'W6', completed: 22, assigned: 24, rate: 92 },
    { week: 'W7', completed: 14, assigned: 17, rate: 82 },
    { week: 'W8', completed: 19, assigned: 21, rate: 90 },
  ];
}

export function buildRetentionData(): RetentionDataPoint[] {
  return [
    { cohort: 'Mar 26', day7: 82, day30: 71, day60: 64 },
    { cohort: 'Apr 26', day7: 85, day30: 74, day60: 68 },
    { cohort: 'May 26', day7: 88, day30: 76, day60: 0 },
  ];
}

export function buildComplianceItems(): ComplianceItem[] {
  return [
    { requirement: 'OSHA Safety Training', deadline: '2026-06-30', total: 24, compliant: 20, atRisk: 3, nonCompliant: 1 },
    { requirement: 'Machine Operation Certification', deadline: '2026-07-15', total: 24, compliant: 18, atRisk: 4, nonCompliant: 2 },
    { requirement: 'Annual Quality Refresher', deadline: '2026-12-31', total: 24, compliant: 22, atRisk: 2, nonCompliant: 0 },
  ];
}

export function buildGenerationQueue(): GenerationJob[] {
  return [
    {
      id: 'job1', topic: 'Alloy Metallurgy for Operators', role: 'Die Casting Operator',
      status: 'generating', progress: 62, startedAt: new Date(Date.now() - 90000).toISOString(),
      agentStep: 'Drafting Section 3: Superheat & Metal Temperature',
    },
    {
      id: 'job2', topic: 'Hydraulic System Maintenance', role: 'Maintenance Engineer',
      status: 'queued', progress: 0, startedAt: new Date(Date.now() - 5000).toISOString(),
      agentStep: 'Waiting for RAG context retrieval',
    },
    {
      id: 'job3', topic: 'Scrap Reduction Techniques', role: 'Process Engineer',
      status: 'review', progress: 100, startedAt: new Date(Date.now() - 600000).toISOString(),
      agentStep: 'Awaiting L&D review approval',
    },
    {
      id: 'job4', topic: 'Emergency Shutdown Procedures', role: 'All Operators',
      status: 'done', progress: 100, startedAt: new Date(Date.now() - 7200000).toISOString(),
      agentStep: 'Published to learning platform',
    },
  ];
}

export function buildEventLog(): AgentEvent[] {
  const now = Date.now();
  return [
    { id: 'e1', timestamp: new Date(now - 1000).toISOString(), agent: 'Conductor', action: 'Path Created', detail: 'Generated 90-day onboarding path for Luca Ferretti (Die Casting Operator)', level: 'success' },
    { id: 'e2', timestamp: new Date(now - 45000).toISOString(), agent: 'Diagnosis', action: 'Gap Report', detail: 'Maria Santos: 3 high-severity gaps detected — Injection, Safety, Metallurgy', level: 'warning' },
    { id: 'e3', timestamp: new Date(now - 90000).toISOString(), agent: 'Content', action: 'Generation Started', detail: 'Generating "Alloy Metallurgy for Operators" — RAG retrieval complete, drafting content', level: 'info' },
    { id: 'e4', timestamp: new Date(now - 180000).toISOString(), agent: 'Assessment', action: 'Grading Complete', detail: 'James Okafor scored 92/100 on Quality Inspection — passed', level: 'success' },
    { id: 'e5', timestamp: new Date(now - 300000).toISOString(), agent: 'Coaching', action: 'Session Started', detail: 'James Okafor opened coaching session on Die Thermal Management topic', level: 'info' },
    { id: 'e6', timestamp: new Date(now - 480000).toISOString(), agent: 'Conductor', action: 'Compliance Alert', detail: 'T-29 days: Luca Ferretti has not started OSHA Safety Training', level: 'warning' },
    { id: 'e7', timestamp: new Date(now - 720000).toISOString(), agent: 'Content', action: 'Module Approved', detail: '"HPDC Fundamentals & Safety" v2 approved and published by Sophie Müller', level: 'success' },
    { id: 'e8', timestamp: new Date(now - 1200000).toISOString(), agent: 'Analytics', action: 'Report Generated', detail: 'Weekly cohort report: 90% completion rate, +6pts vs prior week', level: 'success' },
  ];
}

const COACHING_RESPONSES: Record<string, string[]> = {
  default: [
    "That's a great question. In HPDC, the injection phase has three distinct stages — can you tell me what you understand about Phase 1 (slow shot) so I can build on that?",
    "Let me guide you through this. The key relationship here is between plunger velocity and air entrapment. When velocity is too high in Phase 1, what do you think happens to the air in the shot sleeve?",
    "Good thinking. The intensification pressure (Phase 3) is critical for compensating shrinkage as the metal solidifies. The typical range for aluminum alloys is 400-600 bar. Does that align with what you've seen on the machine?",
    "Exactly right. The die temperature balance is one of the most common sources of defects — cold shuts, misruns, and soldering all trace back to thermal management. What zone is giving you the most trouble?",
    "I want to make sure you've really internalized this: the spaced repetition schedule will bring this topic back in 7 days. Until then, try to apply this when reviewing the plunger trace on your next shift.",
  ],
};

let coachingIdx = 0;

export function getNextCoachingResponse(_userMessage: string): string {
  const responses = COACHING_RESPONSES.default;
  const response = responses[coachingIdx % responses.length];
  coachingIdx++;
  return response;
}

export function tickAgents(agents: Record<string, AgentState>): Record<string, AgentState> {
  const updated = { ...agents };
  const statuses: AgentState['status'][] = ['idle', 'working', 'working', 'working', 'waiting'];

  Object.keys(updated).forEach((key) => {
    if (Math.random() < 0.15) {
      updated[key] = {
        ...updated[key],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        tasksCompleted: updated[key].tasksCompleted + (Math.random() < 0.1 ? 1 : 0),
        lastActivity: Math.random() < 0.3 ? new Date().toISOString() : updated[key].lastActivity,
      };
    }
  });
  return updated;
}
