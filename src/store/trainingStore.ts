import { create } from 'zustand';
import type { TrainingState, ChatMessage, GenerationJob, AgentEvent } from '../types/training';
import {
  buildInitialAgents, buildLearners, buildModules, buildAssessmentResults,
  buildCompletionData, buildRetentionData, buildComplianceItems,
  buildGenerationQueue, buildEventLog, getNextCoachingResponse, tickAgents,
} from '../utils/trainingMockData';

interface TrainingStore extends TrainingState {
  activeTrainingPage: string;
  setActiveTrainingPage: (page: string) => void;
  selectLearner: (id: string | null) => void;
  sendCoachingMessage: (content: string) => void;
  startCoachingSession: (learnerId: string, topic: string) => void;
  tickAgentSimulation: () => void;
  approveModule: (moduleId: string) => void;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  activeTrainingPage: 'training-dashboard',
  agents: buildInitialAgents(),
  learners: buildLearners(),
  modules: buildModules(),
  assessmentResults: buildAssessmentResults(),
  coachingSession: null,
  completionData: buildCompletionData(),
  retentionData: buildRetentionData(),
  complianceItems: buildComplianceItems(),
  selectedLearnerId: null,
  generationQueue: buildGenerationQueue(),
  eventLog: buildEventLog(),

  setActiveTrainingPage: (page) => set({ activeTrainingPage: page }),

  selectLearner: (id) => set({ selectedLearnerId: id }),

  startCoachingSession: (learnerId, topic) => {
    const session = {
      id: `session-${Date.now()}`,
      learnerId,
      mode: 'qa' as const,
      topic,
      messages: [
        {
          id: 'init',
          sender: 'agent' as const,
          content: `Hello! I'm your AI training coach for **${topic}**. I'll guide you through this topic using a Socratic approach — I'll ask questions to help you discover the answers yourself. What would you like to explore first?`,
          timestamp: new Date().toISOString(),
        },
      ],
      startedAt: new Date().toISOString(),
      isActive: true,
    };
    set({ coachingSession: session });
  },

  sendCoachingMessage: (content) => {
    const session = get().coachingSession;
    if (!session) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'learner',
      content,
      timestamp: new Date().toISOString(),
    };

    set({
      coachingSession: {
        ...session,
        messages: [...session.messages, userMsg],
      },
    });

    // Simulate agent "thinking" delay then respond
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        content: getNextCoachingResponse(content),
        timestamp: new Date().toISOString(),
        agentThinking: 'Retrieved context from module KB · Scored learner intent · Applied Socratic pattern',
      };
      const current = get().coachingSession;
      if (current) {
        set({
          coachingSession: {
            ...current,
            messages: [...current.messages, agentMsg],
          },
        });
      }
    }, 1200);
  },

  tickAgentSimulation: () => {
    set((s) => {
      // Tick agents
      const agents = tickAgents(s.agents);

      // Advance generating jobs
      const generationQueue: GenerationJob[] = s.generationQueue.map((job) => {
        if (job.status === 'generating') {
          const newProgress = Math.min(job.progress + Math.random() * 5, 100);
          const steps = [
            'Retrieving from company knowledge base',
            'Drafting learning objectives',
            'Generating section content',
            'Running self-critique pass',
            'Compliance risk scan',
            'Awaiting L&D review approval',
          ];
          const stepIdx = Math.floor((newProgress / 100) * (steps.length - 1));
          return {
            ...job,
            progress: newProgress,
            agentStep: steps[stepIdx],
            status: newProgress >= 100 ? 'review' : 'generating',
          };
        }
        return job;
      });

      // Occasionally add event log entry
      let eventLog = s.eventLog;
      if (Math.random() < 0.08) {
        const newEvents: Omit<AgentEvent, 'id'>[] = [
          { timestamp: new Date().toISOString(), agent: 'Conductor', action: 'Spaced Repetition', detail: 'Scheduled review for 2 learners on Injection Phase Control (7-day interval)', level: 'info' },
          { timestamp: new Date().toISOString(), agent: 'Content', action: 'Quality Check', detail: 'Module "Hydraulic Maintenance" passed reading level check (11.4 Flesch-Kincaid)', level: 'success' },
          { timestamp: new Date().toISOString(), agent: 'Diagnosis', action: 'Assessment Complete', detail: 'Adaptive diagnostic complete for Luca Ferretti — 6 gaps identified', level: 'warning' },
          { timestamp: new Date().toISOString(), agent: 'Analytics', action: 'At-Risk Alert', detail: 'Maria Santos is 40% behind her weekly learning target', level: 'warning' },
        ];
        const pick = newEvents[Math.floor(Math.random() * newEvents.length)];
        eventLog = [{ ...pick, id: `e-${Date.now()}` }, ...eventLog.slice(0, 19)];
      }

      return { agents, generationQueue, eventLog };
    });
  },

  approveModule: (moduleId) => {
    set((s) => ({
      modules: s.modules.map((m) =>
        m.id === moduleId ? { ...m, status: 'approved', reviewedBy: 'L&D Admin' } : m
      ),
    }));
  },
}));
