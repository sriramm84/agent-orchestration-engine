import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  AlertCircle,
  Clock,
  Send,
  Sliders,
} from "lucide-react";
import { runQuery, streamQuery, type QueryResult, type StreamEvent } from "./api";
import Navbar, { type Tab } from "./components/Navbar";
import PipelineTimeline from "./components/PipelineTimeline";
import { reduceStreamEvents } from "./pipelineUtils";
import ResultsDashboard from "./components/ResultsDashboard";
import ReplayDiffView from "./components/ReplayDiffView";
import ArchitectureView from "./components/ArchitectureView";

const PRESET_QUERIES = [
  { label: "AI & ML", query: "What is machine learning and how do neural networks learn?" },
  { label: "Algorithms", query: "Explain deterministic finite automata versus nondeterministic state machines." },
  { label: "Distributed Systems", query: "How does distributed consensus work in Raft and Paxos?" },
  { label: "Scientific Query", query: "What are the core differences between classical computing and quantum computing?" },
];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("run");
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isDark, setIsDark] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Sync dark class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Elapsed timer during execution
  useEffect(() => {
    if (!loading) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading]);

  const handleRun = async (queryToRun?: string) => {
    const q = (queryToRun || query).trim();
    if (!q || loading) return;

    setLoading(true);
    setElapsedSeconds(0);
    setError(null);
    setEvents([]);
    setResult(null);

    try {
      // 1. Stream pipeline events via SSE for real-time stage visualizer
      await streamQuery(q, (event) => {
        setEvents((prev) => [...prev, event]);
      });

      // 2. Fetch full structured result with deterministic hash & provenance
      const finalResult = await runQuery(q);
      setResult(finalResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (newQuery: string) => {
    setQuery(newQuery);
    if (!loading) {
      handleRun(newQuery);
    }
  };

  const { stages, routingDecisions } = reduceStreamEvents(events);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: RUN PIPELINE */}
        {activeTab === "run" && (
          <div className="space-y-6">
            {/* Header / Intro Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Interactive Pipeline Runner
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Trigger a fully deterministic multi-agent workflow. Observe real-time SSE stream events across every agent, review routing decisions, and verify cryptographic trace hashes.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Mode: Deterministic Stub</span>
                  </div>
                </div>
              </div>

              {/* Query Input Box */}
              <div className="mt-6 space-y-3">
                <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
                  <div className="relative flex-1">
                    <input
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRun()}
                      placeholder="Ask anything or test a multi-agent scenario..."
                      disabled={loading}
                    />
                  </div>

                  <button
                    onClick={() => handleRun()}
                    disabled={loading || !query.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold px-6 py-3 shadow-md shadow-indigo-500/20 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Running ({elapsedSeconds}s)...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Run Pipeline</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3" />
                    <span>Quick Examples:</span>
                  </span>
                  {PRESET_QUERIES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(item.query)}
                      disabled={loading}
                      className="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-700/60 disabled:opacity-50 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Execution Failed</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pipeline Stage Visualizer */}
            {(events.length > 0 || loading) && (
              <PipelineTimeline
                stages={stages}
                routingDecisions={routingDecisions}
                agentEvents={result?.execution_trace.agent_events}
                isLoading={loading}
              />
            )}

            {/* Final Structured Results Dashboard */}
            {result && <ResultsDashboard result={result} />}
          </div>
        )}

        {/* TAB 2: REPLAY & DIFF VALIDATOR */}
        {activeTab === "replay" && <ReplayDiffView defaultQuery={query} />}

        {/* TAB 3: ARCHITECTURE & BLUEPRINT */}
        {activeTab === "architecture" && <ArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Deterministic Agent Orchestration • Engine v0.1.0</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI • PostgreSQL • Redis • React 19</span>
            <span>&bull;</span>
            <a
              href="https://github.com/sriramm84/agent-orchestration-engine.git"
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-indigo-500"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
