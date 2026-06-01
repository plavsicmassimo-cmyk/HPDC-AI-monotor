import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { MessageSquare, Send, Bot, User, Lightbulb, PlayCircle } from 'lucide-react';
import { useTrainingStore } from '../../store/trainingStore';

const TOPICS = [
  'Injection Phase Control',
  'Die Thermal Management',
  'Safety & Lockout/Tagout',
  'Alloy Metallurgy',
  'Quality Inspection',
  'Machine Operation',
];

const PERSONAS = [
  { id: 'coach', label: 'Learning Coach', desc: 'Socratic Q&A guidance', icon: '🎓' },
  { id: 'auditor', label: 'Safety Auditor', desc: 'Compliance scenario simulation', icon: '🦺' },
  { id: 'customer', label: 'Quality Inspector', desc: 'Quality review simulation', icon: '🔍' },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CoachingPage() {
  const { coachingSession, startCoachingSession, sendCoachingMessage, learners } = useTrainingStore();
  const [input, setInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [selectedPersona] = useState(PERSONAS[0]);
  const [selectedLearner, setSelectedLearner] = useState(learners[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachingSession?.messages]);

  const handleSend = () => {
    if (!input.trim() || !coachingSession) return;
    sendCoachingMessage(input.trim());
    setInput('');
  };

  const handleStart = () => {
    startCoachingSession(selectedLearner.id, selectedTopic);
  };

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Config panel */}
      <div className="w-64 shrink-0 space-y-4">
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Session Config</span>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Learner</p>
            <div className="space-y-1">
              {learners.slice(0, 3).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLearner(l)}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border',
                    selectedLearner.id === l.id
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : 'border-transparent hover:bg-[#0d1117] text-gray-400'
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-violet-300">{l.avatarInitials}</span>
                  </div>
                  <span className="text-xs truncate">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Topic</p>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-white"
            >
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Mode</p>
            <div className="space-y-1">
              {PERSONAS.map((p) => (
                <div
                  key={p.id}
                  className={clsx(
                    'px-3 py-2 rounded-lg border text-left transition-all',
                    selectedPersona.id === p.id
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'border-[#21262d]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span className="text-xs font-medium text-white">{p.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 ml-6">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-500/30 transition-all"
          >
            <PlayCircle size={14} />
            Start Session
          </button>
        </div>

        {/* Quick prompts */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={12} className="text-amber-400" />
            <span className="text-xs font-semibold text-gray-400">Quick Prompts</span>
          </div>
          {[
            'Explain Phase 1 vs Phase 2',
            'Why does intensification matter?',
            'What causes cold shuts?',
            'Simulate a safety audit',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                if (!coachingSession) return;
                setInput(prompt);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-[#0d1117] border border-[#21262d] text-xs text-gray-400 hover:text-white hover:border-blue-500/30 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-[#161b22] rounded-xl border border-[#21262d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Bot size={15} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Coaching Agent</p>
            <p className="text-xs text-gray-500">
              {coachingSession ? `${selectedPersona.label} · ${coachingSession.topic}` : 'No active session'}
            </p>
          </div>
          {coachingSession && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          )}
        </div>

        {!coachingSession ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <Bot size={40} className="text-gray-700" />
            <p className="text-sm text-gray-500">Configure a session on the left and click <strong className="text-gray-400">Start Session</strong></p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {coachingSession.messages.map((msg) => (
                <div key={msg.id} className={clsx('flex gap-3', msg.sender === 'learner' && 'flex-row-reverse')}>
                  <div className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                    msg.sender === 'agent' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-violet-500/20 border border-violet-500/30'
                  )}>
                    {msg.sender === 'agent' ? <Bot size={13} className="text-blue-400" /> : <User size={13} className="text-violet-400" />}
                  </div>
                  <div className={clsx('max-w-[75%]', msg.sender === 'learner' && 'items-end flex flex-col')}>
                    <div className={clsx(
                      'px-4 py-3 rounded-xl text-sm leading-relaxed',
                      msg.sender === 'agent'
                        ? 'bg-[#0d1117] border border-[#21262d] text-gray-200'
                        : 'bg-violet-500/15 border border-violet-500/25 text-white'
                    )}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {msg.agentThinking && (
                        <span className="text-[10px] text-gray-600 italic">{msg.agentThinking}</span>
                      )}
                      <span className="text-[10px] text-gray-600">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[#21262d]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the coaching agent…"
                  className="flex-1 bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
