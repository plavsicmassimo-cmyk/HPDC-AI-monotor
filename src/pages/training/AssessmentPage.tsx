import React, { useState } from 'react';
import clsx from 'clsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTrainingStore } from '../../store/trainingStore';

const SAMPLE_QUESTIONS = [
  {
    id: 'q1',
    type: 'mcq' as const,
    bloomLevel: 'understand' as const,
    question: 'During Phase 1 of the injection cycle, the primary goal is to:',
    options: [
      'Fill the die cavity as quickly as possible',
      'Fill the shot sleeve while minimizing air entrapment',
      'Apply intensification pressure to compensate for shrinkage',
      'Cool the plunger tip before injection',
    ],
    correctIndex: 1,
    points: 10,
  },
  {
    id: 'q2',
    type: 'scenario' as const,
    bloomLevel: 'apply' as const,
    question: 'An operator notices the plunger trace shows a sudden pressure spike during Phase 2, followed by incomplete fill. The die temperature is within spec. What is the most likely cause and corrective action?',
    options: [
      'Excessive Phase 2 velocity — reduce velocity setpoint by 10%',
      'Insufficient intensification pressure — increase by 50 bar',
      'Phase 2 switchover position too early — move switchover point forward',
      'Metal temperature too low — increase holding furnace by 20°C',
    ],
    correctIndex: 0,
    points: 15,
  },
  {
    id: 'q3',
    type: 'mcq' as const,
    bloomLevel: 'remember' as const,
    question: 'What is the typical intensification pressure range for aluminum alloy A380 in high-pressure die casting?',
    options: ['100–200 bar', '200–350 bar', '400–600 bar', '700–900 bar'],
    correctIndex: 2,
    points: 10,
  },
];

const BLOOM_COLOR: Record<string, string> = {
  remember: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  understand: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
  apply: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  analyze: 'text-red-400 bg-red-500/10 border-red-500/25',
};

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple Choice',
  scenario: 'Scenario',
  open_ended: 'Open Ended',
};

export function AssessmentPage() {
  const { assessmentResults, learners, modules } = useTrainingStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const scoreData = [
    { module: 'Fundamentals', avg: 84, target: 80 },
    { module: 'Injection', avg: 78, target: 80 },
    { module: 'Thermal', avg: 91, target: 80 },
    { module: 'Quality', avg: 88, target: 80 },
    { module: 'Compliance', avg: 95, target: 80 },
  ];

  const handleAnswer = (qId: string, idx: number) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qId]: idx }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < SAMPLE_QUESTIONS.length) return;
    setSubmitted(true);
  };

  const totalScore = submitted
    ? SAMPLE_QUESTIONS.reduce((sum, q) => sum + (answers[q.id] === q.correctIndex ? q.points : 0), 0)
    : 0;
  const maxScore = SAMPLE_QUESTIONS.reduce((s, q) => s + q.points, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Assessment Agent</h1>
          <p className="text-sm text-gray-400 mt-0.5">Adaptive assessments · Bloom's Taxonomy aligned</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Assessments Graded', value: assessmentResults.length + 178, icon: Zap, color: 'text-green-400' },
          { label: 'Avg. Score', value: '86%', icon: CheckCircle2, color: 'text-violet-400' },
          { label: 'Pending Grading', value: 0, icon: Clock, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className={clsx('text-2xl font-bold', color)}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Score chart */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Avg. Score by Module</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="module" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
              <Bar dataKey="avg" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Avg Score" />
              <Bar dataKey="target" fill="#21262d" radius={[4, 4, 0, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent results */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 w-64 shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Results</p>
          <div className="space-y-2">
            {assessmentResults.map((r) => {
              const learner = learners.find(l => l.id === r.learnerId);
              const module = modules.find(m => m.id === r.moduleId);
              const pct = Math.round((r.score / r.maxScore) * 100);
              return (
                <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#0d1117]">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-violet-300">{learner?.avatarInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{learner?.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{module?.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={clsx('text-sm font-bold', pct >= 80 ? 'text-green-400' : 'text-red-400')}>{pct}%</p>
                    <p className="text-[10px] text-gray-600">{r.timeTakenMin}m</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live assessment demo */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Live Assessment Demo — Injection Phase Control</h2>
          {submitted && (
            <div className={clsx('px-3 py-1.5 rounded-lg text-sm font-bold', totalScore >= maxScore * 0.8 ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25')}>
              Score: {totalScore}/{maxScore} ({Math.round((totalScore / maxScore) * 100)}%)
            </div>
          )}
        </div>
        <div className="space-y-4">
          {SAMPLE_QUESTIONS.map((q, qi) => (
            <div key={q.id} className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">Q{qi + 1}</span>
                <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border capitalize', BLOOM_COLOR[q.bloomLevel])}>
                  {q.bloomLevel}
                </span>
                <span className="text-[10px] text-gray-500">{TYPE_LABEL[q.type]}</span>
                <span className="text-[10px] text-gray-500 ml-auto">{q.points} pts</span>
              </div>
              <p className="text-sm text-white">{q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt, oi) => {
                  const isSelected = answers[q.id] === oi;
                  const isCorrect = q.correctIndex === oi;
                  let optClass = 'border-[#21262d] bg-[#0d1117] text-gray-300 hover:border-violet-500/40';
                  if (submitted) {
                    if (isCorrect) optClass = 'border-green-500/50 bg-green-500/10 text-green-300';
                    else if (isSelected && !isCorrect) optClass = 'border-red-500/50 bg-red-500/10 text-red-300';
                    else optClass = 'border-[#21262d] bg-[#0d1117] text-gray-500';
                  } else if (isSelected) {
                    optClass = 'border-violet-500/50 bg-violet-500/10 text-white';
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(q.id, oi)}
                      className={clsx('w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all flex items-center gap-3', optClass)}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                      {submitted && isCorrect && <CheckCircle2 size={14} className="text-green-400 ml-auto shrink-0" />}
                      {submitted && isSelected && !isCorrect && <XCircle size={14} className="text-red-400 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < SAMPLE_QUESTIONS.length}
              className="w-full py-3 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 font-semibold text-sm hover:bg-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Assessment ({Object.keys(answers).length}/{SAMPLE_QUESTIONS.length} answered)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
