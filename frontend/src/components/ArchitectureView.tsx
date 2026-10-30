import {
  Layers,
  ShieldCheck,
  Server,
  Cpu,
} from "lucide-react";

export function ArchitectureView() {
  return (
    <div className="space-y-8">
      {/* Overview Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture Blueprint</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Deterministic Multi-Agent Pipeline Architecture
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Conventional multi-agent frameworks often suffer from non-deterministic divergence, stochastic loops, and unpredictable failure cascades. This system enforces strict state-machine determinism, cryptographically hashed execution traces, and verifiable replayability.
          </p>
        </div>
      </div>

      {/* 4 Pipeline Stages */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span>The Four Deterministic Pipeline Stages</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Decomposer */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Decomposer Agent</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Stage 1
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Analyzes the incoming prompt, extracts atomic sub-questions, identifies semantic dependencies, and builds an immutable execution plan.
            </p>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              Input: Raw Query &rarr; Output: Sub-tasks & Strategy Matrix
            </div>
          </div>

          {/* Retriever */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Retriever Agent</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Stage 2
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Queries external data sources, search engines, vector indexes, or tools. Tool outputs and attribution links are recorded with deterministic keys.
            </p>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              Input: Sub-tasks &rarr; Output: Grounded Evidence & Tool Call Logs
            </div>
          </div>

          {/* Critic */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Critic Agent</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Stage 3
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Verifies logical consistency, filters irrelevant or low-confidence noise, and makes deterministic routing decisions (e.g. bypass or proceed).
            </p>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              Input: Evidence &rarr; Output: Verified Context & Routing Actions
            </div>
          </div>

          {/* Synthesizer */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Synthesizer Agent</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Stage 4
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Consolidates verified facts into the final response, assigns provenance weight vectors to each source citation, and calculates confidence scores.
            </p>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              Input: Verified Context &rarr; Output: Final Answer + Provenance Links
            </div>
          </div>
        </div>
      </div>

      {/* Reproducibility Specification Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Deterministic Hashing & Replay Verification Protocol
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              1. Timing Decoupling
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Real wall-clock milliseconds (<code className="font-mono">latency_ms</code>) and runtime timestamps are stripped before hash computation so varying CPU speeds never cause false divergences.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              2. Canonical Serialization
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The execution graph (agent sequences, tool payloads, routing decisions) is serialized with stable sorted keys before passing to the cryptographic hash digest.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              3. Differential Auditor
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The <code className="font-mono">/replay/compare</code> endpoint audits any pair of traces, highlighting exact behavioral differences if any nondeterminism ever occurs.
            </p>
          </div>
        </div>
      </div>

      {/* Infrastructure Topology */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-500" />
          <span>System Topology & Infrastructure</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1">FastAPI Engine</div>
            <div className="text-slate-500">Async REST + SSE streaming endpoints</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Celery Worker</div>
            <div className="text-slate-500">Distributed task queue execution</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1">PostgreSQL 16</div>
            <div className="text-slate-500">State persistence & audit storage</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Redis 7</div>
            <div className="text-slate-500">Deterministic caching & distributed locks</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArchitectureView;
