import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Calendar, MessageSquare, BookOpen, 
  Settings, Award, HelpCircle, GraduationCap, 
  Bookmark, Inbox, Activity, Clock
} from "lucide-react";

// Types & Seed Data
import { AppState } from "./types";
import { 
  SEED_VOCAB, SEED_GRAMMAR, SEED_READINGS, 
  SEED_ESSAYS, SEED_CHATS, SEED_EXPLORE, SEED_STATS 
} from "./seed";

// Modular Components
import DashboardToday from "./components/DashboardToday";
import CoachRoom from "./components/CoachRoom";
import LibraryCabinet from "./components/LibraryCabinet";
import AnalyticsProgress from "./components/AnalyticsProgress";

const LOCAL_STORAGE_KEY = "ai_english_coach_state_v1";

export default function App() {
  const [state, setState] = useState<AppState>({
    vocabList: SEED_VOCAB,
    grammarErrors: SEED_GRAMMAR,
    readingLogs: SEED_READINGS,
    essayLogs: SEED_ESSAYS,
    chatLogs: SEED_CHATS,
    exploreInbox: SEED_EXPLORE,
    dailyStats: SEED_STATS,
    currentInterest: "Psychology",
    currentCefr: "B1",
    dailyMinutesGoal: 20
  });

  const [activeTab, setActiveTab] = useState<string>("today");

  // Load state from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.vocabList && parsed.grammarErrors) {
          setState(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load state from localStorage:", err);
    }
  }, []);

  // Save state to localStorage whenever it changes
  const updateState = (newState: Partial<AppState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save state to localStorage:", err);
      }
      return updated;
    });
  };

  // Tracking study duration - simple timer ticking in the background to log study minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedStats = [...state.dailyStats];
      const matchedStat = updatedStats.find(s => s.date === todayStr);

      if (matchedStat) {
        matchedStat.durationMinutes += 1;
      } else {
        updatedStats.push({
          date: todayStr,
          durationMinutes: 1,
          vocabReviewed: 0,
          vocabAdded: 0,
          chatTurns: 0,
          essaysWritten: 0,
          readingsCompleted: 0
        });
      }
      updateState({ dailyStats: updatedStats });
    }, 60000); // add 1 minute every 60 seconds

    return () => clearInterval(interval);
  }, [state.dailyStats]);

  // Compute active stats
  const activeMinutesToday = state.dailyStats.find(
    s => s.date === new Date().toISOString().split("T")[0]
  )?.durationMinutes || 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-200 flex flex-col">
      
      {/* Dynamic Nav Bar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-medium text-base tracking-tight text-white">
                Personal Coach
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
            </div>
            <p className="text-xs text-zinc-400">專屬一對一英文口說、寫作與盲點管理</p>
          </div>
        </div>

        {/* Global stats widget */}
        <div className="flex items-center gap-5 text-xs bg-zinc-900/30 border border-zinc-800/60 rounded-lg px-3 py-1.5 w-fit">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">今日學習:</span>
            <span className="font-mono font-medium text-zinc-200">{activeMinutesToday} / {state.dailyMinutesGoal} 分鐘</span>
          </div>

          <div className="w-px h-3 bg-zinc-800" />

          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">程度:</span>
            <span className="font-medium text-zinc-200">CEFR B1 &rarr; B2</span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "today" 
              ? "border-zinc-200 text-white bg-zinc-900/20" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            今日聚焦 (Today)
          </button>

          <button
            onClick={() => setActiveTab("coach")}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "coach" 
              ? "border-zinc-200 text-white bg-zinc-900/20" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            英文教練 (Coach Room)
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "library" 
              ? "border-zinc-200 text-white bg-zinc-900/20" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            學習資料庫 (Library)
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "progress" 
              ? "border-zinc-200 text-white bg-zinc-900/20" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            數據圖表 (Progress)
          </button>
        </div>

        {/* Tab View Render */}
        <div className="pt-2">
          <AnimatePresence mode="wait">
            {activeTab === "today" && (
              <motion.div
                key="today-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <DashboardToday 
                  state={state} 
                  updateState={updateState} 
                  setActiveTab={setActiveTab} 
                />
              </motion.div>
            )}

            {activeTab === "coach" && (
              <motion.div
                key="coach-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <CoachRoom 
                  state={state} 
                  updateState={updateState} 
                />
              </motion.div>
            )}

            {activeTab === "library" && (
              <motion.div
                key="library-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <LibraryCabinet 
                  state={state} 
                  updateState={updateState} 
                />
              </motion.div>
            )}

            {activeTab === "progress" && (
              <motion.div
                key="progress-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <AnalyticsProgress 
                  state={state} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      <footer className="bg-zinc-900 text-zinc-500 text-xs py-8 px-6 text-center border-t border-zinc-900 mt-12 space-y-1">
        <p>AI 個人英文學習教練 — 間隔複習(SRS)、文法盲點地圖及對話不打斷糾偏</p>
        <p className="text-[10px] text-zinc-600">
          Powered by Google AI Studio & Gemini API. Designed with a clean minimalist layout.
        </p>
      </footer>

    </div>
  );
}
