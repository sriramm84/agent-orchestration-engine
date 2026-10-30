import { useState, type ComponentType } from "react";
import {
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  GitBranch,
  CornerDownRight,
  Zap,
} from "lucide-react";
import type { AgentEvent, StreamEvent } from "../api";
import { STAGES, type Stage, type StageState } from "../pipelineUtils";

const STAGE_META: Record<
  Stage,
  { label: string; role: string; icon: ComponentType<{ className?: string }> }
> = {
  decomposer: {
    label: "Decomposer",
    role: "Query Analysis & Task Breakdown",
    icon: FileText,
  },
  retriever: {
    label: "Retriever",
    role: "Deterministic Knowledge Retrieval",
    icon: Search,
  },
  critic: {
    label: "Critic",
    role: "Verification & Fact Assessment",
    icon: ShieldCheck,
  },
  synthesizer: {
    label: "Synthesizer",
    role: "Answer Synthesis & Confidence Scoring",
    icon: Sparkles,
  },
};



interface PipelineTimelineProps {
  stages: Record<Stage, StageState>;
  routingDecisions: StreamEvent[];
  agentEvents?: AgentEvent[];
  isLoading?: boolean;
}

export function PipelineTimeline({
  stages,
  routingDecisions,
  agentEvents,
  isLoading,
}: PipelineTimelineProps) {
  const [showDecisions, setShowDecisions] = useState(true);

  const getAgentMetric = (stage: Stage) => {
    return agentEvents?.find((e) => e.agent_id === stage);
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              Pipeline Execution Graph
            </h3>
            {isLoading && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full animate-pulse">
                Processing Stream...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic sequence: Decomposer &rarr; Retriever &rarr; Critic &rarr; Synthesizer
          </p>
        </div>

        {routingDecisions.length > 0 && (
          <button
            onClick={() => setShowDecisions(!showDecisions)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors w-fit"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>{routingDecisions.length} Routing Decision{routingDecisions.length > 1 ? "s" : ""}</span>
            {showDecisions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Visual Pipeline Node Sequence */}
      <div className="py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {STAGES.map((stage, index) => {
            const meta = STAGE_META[stage];
            const state = stages[stage];
            const metric = getAgentMetric(stage);
            const Icon = meta.icon;

            const isDone = state.status === "done";
            const isRunning = state.status === "running";
            const isSkipped = state.status === "skipped";

            return (
              <div
                key={stage}
                className={`relative rounded-xl p-4 transition-all duration-200 border ${
                  isRunning
                    ? "bg-indigo-500/5 dark:bg-indigo-950/30 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500"
                    : isDone
                    ? "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80"
                    : isSkipped
                    ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/50 opacity-70"
                    : "bg-slate-50/20 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60"
                }`}
              >
                {/* Node Top: Step & Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
                      0{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white capitalize">
                      {meta.label}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isRunning && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500 text-white animate-pulse">
                      <Clock className="w-3 h-3 animate-spin" />
                      Active
                    </span>
                  )}
                  {isDone && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </span>
                  )}
                  {isSkipped && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                      Skipped
                    </span>
                  )}
                  {state.status === "pending" && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Queued
                    </span>
                  )}
                </div>

                {/* Node Center Icon & Role */}
                <div className="flex items-start gap-3 my-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isRunning
                        ? "bg-indigo-600 text-white"
                        : isDone
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isSkipped
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {meta.role}
                    </p>
                  </div>
                </div>

                {/* Node Bottom Telemetry Metrics */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Latency</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {metric?.latency_ms != null
                      ? `${metric.latency_ms.toFixed(0)} ms`
                      : isRunning
                      ? "Measuring..."
                      : isSkipped
                      ? "—"
                      : "Pending"}
                  </span>
                </div>

                {metric?.token_count != null && metric.token_count > 0 && (
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Tokens</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {metric.token_count}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Routing Decisions */}
      {routingDecisions.length > 0 && showDecisions && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
            Deterministic Routing Decisions Log
          </h4>

          <div className="space-y-2.5">
            {routingDecisions.map((decision, index) => {
              const selectedAction = String(decision.selected_action || "default");
              const triggerReason = String(decision.trigger_reason || "Heuristic decision");
              const confidence = typeof decision.confidence === "number" ? decision.confidence : null;
              const rejected = Array.isArray(decision.rejected_actions) ? decision.rejected_actions : [];

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 px-2 py-0.5 rounded">
                        {selectedAction}
                      </span>
                      {Boolean(decision.decision_type) && (
                        <span className="text-slate-400 text-[11px]">
                          type: {String(decision.decision_type)}
                        </span>
                      )}
                    </div>

                    {confidence != null && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        confidence: {(confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] flex items-start gap-1.5 mb-1.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{triggerReason}</span>
                  </p>

                  {rejected.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pl-5">
                      <span>Rejected alternatives:</span>
                      {rejected.map((rej, rIdx) => (
                        <span
                          key={rIdx}
                          className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded line-through text-slate-500"
                        >
                          {String(rej)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineTimeline;
