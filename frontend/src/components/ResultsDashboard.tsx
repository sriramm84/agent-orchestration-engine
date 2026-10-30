import { useState } from "react";
import {
  Sparkles,
  Hash,
  ShieldAlert,
  Copy,
  Check,
  Download,
  BookOpen,
  Wrench,
  Terminal,
  Layers,
} from "lucide-react";
import type { QueryResult } from "../api";

interface ResultsDashboardProps {
  result: QueryResult;
}

type ResultTab = "answer" | "provenance" | "agents" | "raw";

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("answer");
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedTrace, setCopiedTrace] = useState(false);

  const copyToClipboard = async (text: string, setFn: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setFn(true);
      setTimeout(() => setFn(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadTrace = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trace-${result.job_id || "execution"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const provenanceEntries = Object.entries(result.provenance_links || {});
  const agentEvents = result.execution_trace?.agent_events || [];
  const toolCalls = result.execution_trace?.tool_calls || [];
  const confidence = result.confidence_score;

  const totalAgentLatency = agentEvents.reduce((acc, curr) => acc + (curr.latency_ms || 0), 0);
  const totalTokens = agentEvents.reduce((acc, curr) => acc + (curr.token_count || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Telemetry KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 dark:border-slate-800 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Status */}
        <div className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pipeline Verdict
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                result.success ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {result.success ? "Success (Resolved)" : "Failed"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
            Job ID: {result.job_id}
          </span>
        </div>

        {/* Confidence */}
        <div className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Confidence</span>
            {confidence != null && (
              <span className="text-[10px] text-slate-400 font-mono">
                {(confidence * 100).toFixed(0)}%
              </span>
            )}
          </span>
          <div className="mt-2">
            {confidence != null ? (
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      confidence >= 0.8
                        ? "bg-emerald-500"
                        : confidence >= 0.5
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, confidence * 100))}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {confidence >= 0.8 ? "High Certainty" : confidence >= 0.5 ? "Moderate" : "Low Certainty"}
                </div>
              </div>
            ) : (
              <span className="text-sm text-slate-400">N/A</span>
            )}
          </div>
        </div>

        {/* Latency & Tokens */}
        <div className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Compute & Latency
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {totalAgentLatency.toFixed(0)}
            </span>
            <span className="text-xs text-slate-500 font-mono">ms compute</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalTokens > 0 ? `${totalTokens} tokens processed` : `${agentEvents.length} agent hops`}
          </span>
        </div>

        {/* Execution Hash */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Hash className="w-3 h-3 text-indigo-400" />
              <span>Trace Hash</span>
            </span>
            <button
              onClick={() => copyToClipboard(result.execution_hash, setCopiedHash)}
              title="Copy Execution Hash"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="mt-1">
            <span
              title={result.execution_hash}
              className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 block truncate"
            >
              {result.execution_hash || "hash-not-available"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Deterministic reproducibility key
          </span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900/40">
        <div className="flex space-x-1 sm:space-x-3">
          <button
            onClick={() => setActiveTab("answer")}
            className={`flex items-center gap-2 py-3.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "answer"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesized Answer</span>
          </button>

          <button
            onClick={() => setActiveTab("provenance")}
            className={`flex items-center gap-2 py-3.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "provenance"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Provenance Citations ({provenanceEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("agents")}
            className={`flex items-center gap-2 py-3.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "agents"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Agent Telemetry & Tools ({toolCalls.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("raw")}
            className={`flex items-center gap-2 py-3.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "raw"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Trace JSON</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* Errors & Warnings Banners */}
        {result.errors?.length > 0 && (
          <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wide">
                  Execution Errors Encountered
                </h5>
                <ul className="mt-1 list-disc list-inside text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Answer */}
        {activeTab === "answer" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Final Response
                </span>
                <span className="text-[10px] text-slate-400">
                  Produced by Synthesizer Agent
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(result.final_answer || "", setCopiedAnswer)}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
              >
                {copiedAnswer ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80">
              {result.final_answer || "No response text generated."}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <span>Query:</span>
                <span className="text-slate-600 dark:text-slate-300 italic">"{result.query}"</span>
              </div>
              <div className="text-[11px] font-mono">
                Provenance sources attached: {provenanceEntries.length}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Provenance */}
        {activeTab === "provenance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Grounded Sources & Attribution
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Every fact synthesized in the answer traces back to these deterministic references.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {provenanceEntries.length} Citation{provenanceEntries.length !== 1 ? "s" : ""}
              </span>
            </div>

            {provenanceEntries.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500">
                No external provenance links were registered for this answer.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {provenanceEntries.map(([key, record], idx) => {
                  const weight = typeof record.weight === "number" ? record.weight : 1.0;
                  const weightPercent = Math.min(100, Math.round(weight * 100));

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {record.source_id || key}
                          </span>
                          <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                            weight {weight.toFixed(2)}
                          </span>
                        </div>

                        {/* Weight bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${weightPercent}%` }}
                          />
                        </div>

                        {record.metadata && Object.keys(record.metadata).length > 0 && (
                          <div className="mt-3 bg-white dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Metadata Attributes
                            </span>
                            <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                              {JSON.stringify(record.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Attribution node #{idx + 1}</span>
                        <span className="font-mono">{key}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Agents & Tools */}
        {activeTab === "agents" && (
          <div className="space-y-6">
            {/* Agent Events */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Agent Execution Events ({agentEvents.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {agentEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {event.agent_id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          event.status === "completed" || event.status === "success"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Latency:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {event.latency_ms?.toFixed(0)} ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tokens:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {event.token_count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retries:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {event.retries || 0}
                        </span>
                      </div>
                    </div>

                    {event.error && (
                      <div className="mt-2 text-[10px] text-rose-500 font-mono bg-rose-50 dark:bg-rose-950 p-1.5 rounded">
                        {event.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tool Calls */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                  Tool Invocations ({toolCalls.length})
                </h4>
                <span className="text-[11px] text-slate-500">
                  Latency stripped before trace hashing to preserve determinism
                </span>
              </div>

              {toolCalls.length === 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                  No downstream tools were invoked during this pipeline execution.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {toolCalls.map((call, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {call.tool_name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              call.success
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {call.success ? "success" : "failed"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                          {call.latency_ms != null && <span>{call.latency_ms.toFixed(0)} ms</span>}
                          <span>retries: {call.retries}</span>
                        </div>
                      </div>

                      {call.output && (
                        <div className="bg-white dark:bg-slate-950/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 mt-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Tool Payload Output
                          </span>
                          <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                            {JSON.stringify(call.output, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Raw Trace */}
        {activeTab === "raw" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Execution Trace Payload
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2), setCopiedTrace)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  {copiedTrace ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadTrace}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-96 overflow-y-auto leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;
