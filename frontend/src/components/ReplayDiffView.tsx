import { useState } from "react";
import {
  GitCompare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hash,
  RefreshCw,
  Layers,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { runQuery, compareTraces, type QueryResult, type CompareResult } from "../api";

interface ReplayDiffViewProps {
  defaultQuery: string;
}

const PRESET_QUERIES = [
  "What is machine learning?",
  "How does transformer self-attention work?",
  "Explain deterministic state machines and finite automata.",
  "Calculate the compound annual growth rate of 100 to 250 over 5 years.",
];

export function ReplayDiffView({ defaultQuery }: ReplayDiffViewProps) {
  const [query, setQuery] = useState(defaultQuery || PRESET_QUERIES[0]);
  const [runA, setRunA] = useState<QueryResult | null>(null);
  const [runB, setRunB] = useState<QueryResult | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHashA, setCopiedHashA] = useState(false);
  const [copiedHashB, setCopiedHashB] = useState(false);

  const copyToClipboard = async (text: string, setFn: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setFn(true);
      setTimeout(() => setFn(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRunDiff = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setComparison(null);
    setRunA(null);
    setRunB(null);

    try {
      // Run the pipeline twice independently
      const [resA, resB] = await Promise.all([runQuery(query), runQuery(query)]);
      setRunA(resA);
      setRunB(resB);

      // Compare traces via backend replay engine
      const diffResult = await compareTraces(resA, resB);
      setComparison(diffResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const hashA = comparison?.trace1_hash || runA?.execution_hash || "";
  const hashB = comparison?.trace2_hash || runB?.execution_hash || "";
  const isHashMatch = hashA && hashB && hashA === hashB;

  return (
    <div className="space-y-6">
      {/* Overview & Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <GitCompare className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Replay & Determinism Differential Validator
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifies end-to-end reproducibility by running the pipeline twice in parallel, computing cryptographic trace hashes, and validating zero divergence.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cryptographic Proof Engine</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-sans"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunDiff()}
                placeholder="Enter query to run twice and verify determinism..."
              />
            </div>

            <button
              onClick={handleRunDiff}
              disabled={loading || !query.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 shadow-md shadow-indigo-500/20 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Dual Pipeline...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Run Dual Pipeline & Compare</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Presets:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(preset)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-700/60 truncate max-w-[200px]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Results Card */}
      {comparison && (
        <div className="space-y-6">
          {/* Main Verdict Banner */}
          <div
            className={`rounded-2xl border p-5 transition-all ${
              comparison.identical
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-sm"
                : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    comparison.identical
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {comparison.identical ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    {comparison.identical
                      ? "100% Deterministic & Reproducible"
                      : `Divergence Detected (${comparison.divergence_count} Differences)`}
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {comparison.identical
                      ? "Both executions produced identical agent sequences, matched routing decisions, identical tool inputs/outputs, and equal trace hashes."
                      : "The two execution traces diverged during pipeline processing. Review itemized differences below."}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase ${
                  comparison.identical
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                }`}
              >
                {comparison.identical ? "Verified Deterministic" : "Diverged"}
              </span>
            </div>

            {/* Divergence List if any */}
            {comparison.divergences?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amber-500/20">
                <span className="text-xs font-bold uppercase tracking-wider block mb-2">
                  Divergence Audit Log:
                </span>
                <ul className="space-y-1.5 text-xs font-mono">
                  {comparison.divergences.map((div, i) => (
                    <li key={i} className="flex items-start gap-2 bg-amber-500/10 p-2 rounded-lg">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                      <span>{div}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Dual Trace Inspector Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Run A */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                    A
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Execution Trace #1
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    comparison.trace_a_valid
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {comparison.trace_a_valid ? "Valid Trace" : "Invalid Trace"}
                </span>
              </div>

              {/* Hash Card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-indigo-400" />
                    <span>Cryptographic Trace Hash</span>
                    {isHashMatch && (
                      <span className="ml-1 text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Matched
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => copyToClipboard(hashA, setCopiedHashA)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {copiedHashA ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {hashA || "hash-not-available"}
                </div>
              </div>

              {/* Agent Sequence */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Agent Sequence</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(comparison.trace1_agents || []).map((agent, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tool Calls count */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Tool Calls Recorded:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {comparison.trace1_tools} calls
                </span>
              </div>
            </div>

            {/* Run B */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center">
                    B
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Execution Trace #2 (Replay)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    comparison.trace_b_valid
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {comparison.trace_b_valid ? "Valid Trace" : "Invalid Trace"}
                </span>
              </div>

              {/* Hash Card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-purple-400" />
                    <span>Cryptographic Trace Hash</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(hashB, setCopiedHashB)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {copiedHashB ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 truncate">
                  {hashB || "hash-not-available"}
                </div>
              </div>

              {/* Agent Sequence */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Agent Sequence</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(comparison.trace2_agents || []).map((agent, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tool Calls count */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Tool Calls Recorded:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {comparison.trace2_tools} calls
                </span>
              </div>
            </div>
          </div>

          {/* Reproducibility Explanation Footer */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 p-4 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>How determinism is computed:</strong> The trace hash is calculated from the query, the agent invocation sequence, sanitized tool-call outputs, and deterministic routing decisions. Purely non-deterministic wall-clock timings (such as latency in milliseconds and real-time timestamps) are stripped before hashing, guaranteeing that two identical runs produce identical hashes regardless of transient system load.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplayDiffView;
