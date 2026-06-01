import React from 'react';
import clsx from 'clsx';
import { FileText, Clock, CheckCircle2, AlertCircle, Star, Eye, ThumbsUp } from 'lucide-react';
import { useTrainingStore } from '../../store/trainingStore';
import type { TrainingModule, GenerationJob } from '../../types/training';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  generating: { label: 'Generating', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  review: { label: 'In Review', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25' },
  approved: { label: 'Approved', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25' },
  published: { label: 'Published', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/25' },
  archived: { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/25' },
};

const FORMAT_ICON: Record<string, string> = {
  text: 'TXT',
  slides: 'PPT',
  video_script: 'VID',
  simulation: 'SIM',
  quiz: 'QIZ',
};

function QualityStars({ score }: { score: number }) {
  if (score === 0) return <span className="text-xs text-gray-600">Pending</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={10} className={i <= Math.round(score) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
      ))}
      <span className="text-xs text-gray-400 ml-1">{score.toFixed(1)}</span>
    </div>
  );
}

function ModuleCard({ module, onApprove }: { module: TrainingModule; onApprove: () => void }) {
  const cfg = STATUS_CONFIG[module.status];
  return (
    <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 bg-[#0d1117] border border-[#21262d] px-2 py-0.5 rounded">
            {FORMAT_ICON[module.format]}
          </span>
          <p className="text-sm font-semibold text-white leading-tight">{module.title}</p>
        </div>
        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border shrink-0 font-medium', cfg.color, cfg.bg, cfg.border)}>
          {cfg.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {module.topicTags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#0d1117] border border-[#21262d] text-gray-400">{tag}</span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#0d1117] rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Duration</p>
          <p className="text-xs font-semibold text-white">{module.estimatedDurationMin}m</p>
        </div>
        <div className="bg-[#0d1117] rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Grade Level</p>
          <p className="text-xs font-semibold text-white">{module.readingLevel > 0 ? module.readingLevel.toFixed(1) : '—'}</p>
        </div>
        <div className="bg-[#0d1117] rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Version</p>
          <p className="text-xs font-semibold text-white">v{module.version}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <QualityStars score={module.qualityScore} />
        {module.reviewedBy ? (
          <span className="text-[10px] text-gray-500">Reviewed by {module.reviewedBy}</span>
        ) : (
          <span className="text-[10px] text-gray-600">Awaiting review</span>
        )}
      </div>

      {module.status === 'review' && (
        <button
          onClick={onApprove}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium hover:bg-violet-500/25 transition-all"
        >
          <ThumbsUp size={12} />
          Approve & Publish
        </button>
      )}
    </div>
  );
}

function JobRow({ job }: { job: GenerationJob }) {
  const statusColor: Record<string, string> = {
    queued: 'text-gray-500',
    generating: 'text-amber-400',
    review: 'text-blue-400',
    done: 'text-green-400',
  };
  return (
    <div className="px-4 py-3 border-b border-[#21262d] last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={clsx('text-xs font-semibold capitalize', statusColor[job.status])}>
            {job.status}
          </span>
          <span className="text-sm text-white">{job.topic}</span>
          <span className="text-xs text-gray-500">· {job.role}</span>
        </div>
        <span className="text-xs text-gray-400">{job.progress}%</span>
      </div>
      <div className="h-1 bg-[#21262d] rounded-full overflow-hidden mb-1.5">
        <div
          className={clsx('h-full rounded-full transition-all', {
            'bg-gray-600': job.status === 'queued',
            'bg-amber-500': job.status === 'generating',
            'bg-blue-500': job.status === 'review',
            'bg-green-500': job.status === 'done',
          })}
          style={{ width: `${job.progress}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-600">{job.agentStep}</p>
    </div>
  );
}

export function ContentPage() {
  const { modules, generationQueue, approveModule } = useTrainingStore();

  const counts = {
    generating: modules.filter(m => m.status === 'generating').length,
    review: modules.filter(m => m.status === 'review').length,
    approved: modules.filter(m => m.status === 'approved').length,
    published: modules.filter(m => m.status === 'published').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Content Generator Agent</h1>
          <p className="text-sm text-gray-400 mt-0.5">AI-generated training modules · RAG-grounded</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Generating', count: counts.generating, icon: Clock, color: 'text-amber-400' },
          { label: 'In Review', count: counts.review, icon: Eye, color: 'text-blue-400' },
          { label: 'Approved', count: counts.approved, icon: CheckCircle2, color: 'text-violet-400' },
          { label: 'Published', count: counts.published, icon: FileText, color: 'text-green-400' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className={clsx('text-2xl font-bold', color)}>{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Generation queue */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Generation Queue</h2>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] overflow-hidden">
          {generationQueue.map((job) => <JobRow key={job.id} job={job} />)}
        </div>
      </div>

      {/* Module library */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Module Library</h2>
        <div className="grid grid-cols-3 gap-4">
          {modules.map((m) => (
            <ModuleCard key={m.id} module={m} onApprove={() => approveModule(m.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
