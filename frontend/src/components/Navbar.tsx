import { useEffect, useState } from "react";
import {
  Play,
  GitCompare,
  Layers,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { checkHealth, type HealthStatus } from "../api";

export type Tab = "run" | "replay" | "architecture";

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHealth = async () => {
      try {
        const data = await checkHealth();
        if (isMounted) setHealth(data);
      } catch {
        if (isMounted) setHealth({ api: "error", db: "unavailable", redis: "unavailable" });
      } finally {
        if (isMounted) setHealthLoading(false);
      }
    };

    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isHealthy = health?.api === "ok" && health?.db === "ok" && health?.redis === "ok";
  const isDegraded = health && !isHealthy && (health.api === "ok" || health.db === "ok");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Deterministic Orchestration
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                  Mega AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Replayable, bit-for-bit verifiable multi-agent pipeline
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onTabChange("run")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === "run"
                  ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Pipeline Runner</span>
            </button>

            <button
              onClick={() => onTabChange("replay")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === "replay"
                  ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Replay & Diff</span>
            </button>

            <button
              onClick={() => onTabChange("architecture")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Right actions: Health indicator, Theme Toggle, GitHub */}
          <div className="flex items-center gap-2">
            {/* System Health Pill */}
            <div
              title={
                health
                  ? `API: ${health.api} | DB: ${health.db} | Redis: ${health.redis}`
                  : "Checking infrastructure..."
              }
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-help"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isHealthy
                      ? "bg-emerald-400"
                      : isDegraded
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isHealthy
                      ? "bg-emerald-500"
                      : isDegraded
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {healthLoading
                  ? "Checking..."
                  : isHealthy
                  ? "System Ready"
                  : isDegraded
                  ? "Degraded"
                  : "Offline"}
              </span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/sriramm84/agent-orchestration-engine.git"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="View on GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
