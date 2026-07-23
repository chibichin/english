import React from "react";
import { motion } from "motion/react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  TrendingUp, Award, Calendar, AlertCircle, BookOpen, 
  MessageSquare, Brain, CheckCircle
} from "lucide-react";
import { AppState } from "../types";

interface AnalyticsProgressProps {
  state: AppState;
}

export default function AnalyticsProgress({ state }: AnalyticsProgressProps) {
  
  // 1. Spaced Repetition Level Distribution
  const levelsCount = [0, 0, 0, 0, 0, 0]; // 0 to 5 indexes
  state.vocabList.forEach(v => {
    if (v.level >= 1 && v.level <= 5) {
      levelsCount[v.level]++;
    }
  });

  const vocabLevelData = [
    { name: "L1 (看過)", count: levelsCount[1], fill: "#f43f5e" },
    { name: "L2 (認得)", count: levelsCount[2], fill: "#f59e0b" },
    { name: "L3 (能回想)", count: levelsCount[3], fill: "#06b6d4" },
    { name: "L4 (能造句)", count: levelsCount[4], fill: "#6366f1" },
    { name: "L5 (已掌握)", count: levelsCount[5], fill: "#10b981" }
  ];

  // 2. Daily study duration bar chart
  const dailyStudyData = state.dailyStats.map(s => ({
    date: s.date.slice(5), // MM-DD format
    "學習時間 (分鐘)": s.durationMinutes,
    "已複習單字": s.vocabReviewed,
    "已讀文章": s.readingsCompleted
  }));

  // 3. Grammar Pitfalls distribution
  const grammarCategories: Record<string, number> = {};
  state.grammarErrors.forEach(g => {
    grammarCategories[g.category] = (grammarCategories[g.category] || 0) + g.count;
  });

  const grammarData = Object.keys(grammarCategories).map(cat => ({
    name: cat,
    value: grammarCategories[cat]
  }));

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

  // 4. Speaking Flow length trend
  // Simulated dates over historical study logs
  const speakingFlowData = [
    { date: "07-15", wordsCount: 12 },
    { date: "07-16", wordsCount: 15 },
    { date: "07-17", wordsCount: 14 },
    { date: "07-18", wordsCount: 22 },
    { date: "07-19", wordsCount: 28 } // increasing word length
  ];

  const totalWords = state.vocabList.length;
  const masteredWords = levelsCount[5];
  const masterRatio = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  return (
    <div className="space-y-6" id="analytics-progress-root">
      
      {/* High-level stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl space-y-2 shadow-sm">
          <span className="text-zinc-400 text-xs font-semibold block">單字掌握度 (Master Ratio)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{masterRatio}%</span>
            <span className="text-xs text-zinc-500 font-mono">({masteredWords} / {totalWords} 個)</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            達到 Level 5 (無選項拼寫、在 Conversation 中熟練使用且不再出錯) 判定為熟練掌握。
          </p>
        </div>

        <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl space-y-2 shadow-sm">
          <span className="text-zinc-400 text-xs font-semibold block">口說組織流暢度 (Speaking Flow)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-300 font-mono">28.4</span>
            <span className="text-xs text-zinc-500">平均單次句長 (words)</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            比上週提升了 +15.2%，顯示您正在克服短句習慣，主動朝 B2 連接複句邁進。
          </p>
        </div>

        <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl space-y-2 shadow-sm">
          <span className="text-zinc-400 text-xs font-semibold block">最常犯的文法錯誤類別</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">
              {grammarData.length > 0 ? grammarData.sort((a,b)=>b.value - a.value)[0]?.name.split(" ")[0] : "無"}
            </span>
            <span className="text-xs text-zinc-500">最高頻盲點</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            已加入盲點地圖。系統將在接下來的文章和角色扮演中，針對性地編排 correct 用法。
          </p>
        </div>

        <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl space-y-2 shadow-sm">
          <span className="text-zinc-400 text-xs font-semibold block">連續登入學習天數</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">4 天</span>
            <span className="text-xs text-zinc-500">本週目標達成</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            即使每天只花 5 分鐘複習過期單字，系統也視為連續學習，陪伴您無痛堅持。
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Vocab Memory Distribution */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-zinc-300" />
              單字間隔記憶階層分佈 (Memory Stage Levels)
            </h3>
            <p className="text-[11px] text-zinc-500">
              顯示單字庫在遺忘曲線中的分布。透過主動複習，將 Level 1 穩步推向 Level 5。
            </p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vocabLevelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {vocabLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Speaking character/word length over dates */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-zinc-300" />
              口說原創句長成長曲線 (Speaking Complexity Flow)
            </h3>
            <p className="text-[11px] text-zinc-500">
              衡量您在無提示對話中的原創句子複雜度，平均句長越長代表連接詞與修飾句型掌握度越佳。
            </p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speakingFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wordsCount" 
                  name="單次對話平均句長(字數)" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 5, strokeWidth: 2, fill: "#0f172a" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Study allocated minutes */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-300" />
              每日投入學習時間分佈 (Daily Habit Minutes)
            </h3>
            <p className="text-[11px] text-zinc-500">
              記錄每天用於複習、對話及作文分析的總時間，養成規律的英語大腦。
            </p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStudyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="學習時間 (分鐘)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Pie chart for grammar Categories */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-zinc-300" />
              語法盲點範疇佔比 (Grammar Pitfalls Categories)
            </h3>
            <p className="text-[11px] text-zinc-500">
              分析您在對話和寫作中最常觸犯的語意缺失，以便安排未來的對焦攻防。
            </p>
          </div>

          <div className="h-[250px] w-full flex items-center justify-center">
            {grammarData.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center">暫無語法盲點分類統計</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={grammarData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {grammarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
