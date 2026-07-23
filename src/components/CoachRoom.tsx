import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, PenTool, BookOpen, Send, Sparkles, 
  Trash2, Plus, Check, Play, Volume2, HelpCircle, 
  ChevronRight, RefreshCw, AlertCircle, Award, ArrowUpRight
} from "lucide-react";
import { AppState, VocabItem, GrammarErrorMap, EssayLog, ChatLog } from "../types";

interface CoachRoomProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

export default function CoachRoom({ state, updateState }: CoachRoomProps) {
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "essay" | "reading">("chat");

  // ----------------------------------------------------
  // SUB-TAB: AI CONVERSATION COACH
  // ----------------------------------------------------
  const [selectedScenario, setSelectedScenario] = useState("free");
  const [chatTopic, setChatTopic] = useState("Daily conversation & psychology");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "init-1",
      sender: "coach",
      text: "Hello! I am your AI English Coach. We can chat about anything you like—such as psychology, daily life, or business work. Or you can pick a specific role-play task above. What shall we talk about today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [userChatInput, setUserChatInput] = useState("");
  // Track all corrections caught in current chat session
  const [sessionCorrections, setSessionCorrections] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // SCENARIO OPTIONS
  const SCENARIOS = [
    { id: "free", label: "自由聊天 (Free Chat)", topic: "Daily life, psychology & workplace", placeholder: "What's on your mind today?" },
    { id: "restaurant", label: "情境：處理餐廳點錯餐 (Restaurant Mistake)", topic: "Politely handling a wrong order at a premium restaurant", placeholder: "Hi waiter, I think there is a small problem with my dish..." },
    { id: "refusal", label: "情境：向主管說明工作延誤 (Work Delay Explanations)", topic: "Explaining project delays and refusing additional workload politely", placeholder: "Hi manager, regarding the marketing project update..." },
    { id: "debate", label: "情境：禮貌地表達不同意見 (Polite Disagreement)", topic: "Disagreeing politely during a business strategy meeting", placeholder: "I see your point about the budget, however..." }
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!userChatInput.trim()) return;

    const userMessageId = "msg-" + Date.now();
    const newUserMessage = {
      id: userMessageId,
      sender: "user",
      text: userChatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setUserChatInput("");
    setChatLoading(true);

    try {
      const chatHistory = [...chatMessages, newUserMessage].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const activeVocabs = state.vocabList.slice(0, 3).map(v => v.word);

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          topic: chatTopic,
          vocabularyWords: activeVocabs
        })
      });

      if (!response.ok) throw new Error("AI Coach disconnected");
      const data = await response.json();

      const coachMessageId = "coach-" + Date.now();
      setChatMessages(prev => [
        ...prev,
        {
          id: coachMessageId,
          sender: "coach",
          text: data.reply,
          timestamp: new Date().toISOString()
        }
      ]);

      if (data.corrections && data.corrections.length > 0) {
        setSessionCorrections(prev => [...data.corrections, ...prev]);

        // Automatically store grammar mistakes to personal library map
        let updatedGrammars = [...state.grammarErrors];
        data.corrections.forEach((corr: any) => {
          const matched = updatedGrammars.find(g => g.originalText.toLowerCase() === corr.original.toLowerCase());
          if (matched) {
            matched.count += 1;
            matched.lastOccurred = new Date().toISOString();
          } else {
            updatedGrammars.push({
              id: "g-" + Date.now() + Math.random().toString(36).substring(7),
              originalText: corr.original,
              correctedText: corr.improved,
              ruleExplanation: corr.explanation,
              category: corr.category,
              count: 1,
              lastOccurred: new Date().toISOString()
            });
          }
        });

        updateState({ grammarErrors: updatedGrammars });
      }

      // Update study stats
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedStats = [...state.dailyStats];
      const matchedStat = updatedStats.find(s => s.date === todayStr);
      if (matchedStat) {
        matchedStat.chatTurns += 1;
      } else {
        updatedStats.push({
          date: todayStr,
          durationMinutes: 5,
          vocabReviewed: 0,
          vocabAdded: 0,
          chatTurns: 1,
          essaysWritten: 0,
          readingsCompleted: 0
        });
      }
      updateState({ dailyStats: updatedStats });

    } catch (err) {
      console.error(err);
      // Fallback response if API fails
      setChatMessages(prev => [
        ...prev,
        {
          id: "coach-fb-" + Date.now(),
          sender: "coach",
          text: "I read your message! That sounds fascinating. Could you explain your point in a bit more detail? Try using 'put off' or 'feel overwhelmed' if they fit!",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectScenario = (sc: any) => {
    setSelectedScenario(sc.id);
    setChatTopic(sc.topic);
    setChatMessages([
      {
        id: "sc-init-" + Date.now(),
        sender: "coach",
        text: `We have started our roleplay: "${sc.label}".\nYour scenario objective: ${sc.topic}.\nLet's get started! whenever you are ready, say hello.`,
        timestamp: new Date().toISOString()
      }
    ]);
  };


  // ----------------------------------------------------
  // SUB-TAB: ESSAY REVISION desk
  // ----------------------------------------------------
  const [essayContent, setEssayContent] = useState("");
  const [essayTopic, setEssayTopic] = useState("Describe a time you overcame procrastination");
  const [essayFocus, setEssayFocus] = useState("Grammar, formal vocabulary variety, and transitions");
  const [essayLoading, setEssayLoading] = useState(false);
  const [analyzedEssay, setAnalyzedEssay] = useState<any>(null);
  const [savedWordsStatus, setSavedWordsStatus] = useState<Record<string, boolean>>({});

  const handleAnalyzeEssay = async () => {
    if (!essayContent.trim()) return;
    setEssayLoading(true);
    setAnalyzedEssay(null);
    setSavedWordsStatus({});

    try {
      const response = await fetch("/api/coach/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay: essayContent,
          topic: essayTopic,
          focus: essayFocus
        })
      });

      if (!response.ok) throw new Error("Essay Analysis timed out");
      const data = await response.json();
      setAnalyzedEssay(data);

      // Save to personal essay history log
      const newEssayLog: EssayLog = {
        id: "e-log-" + Date.now(),
        topic: essayTopic,
        originalContent: essayContent,
        minimumCorrection: data.minimumCorrection,
        naturalB2: data.naturalB2,
        strengths: data.strengths,
        priorityImprovements: data.priorityImprovements,
        scores: data.scores,
        corrections: data.corrections,
        studiedAt: new Date().toISOString()
      };

      // Automatically sync caught grammar fixes in essay to Grammar Error map
      let updatedGrammars = [...state.grammarErrors];
      data.corrections.forEach((c: any) => {
        const matched = updatedGrammars.find(g => g.originalText.toLowerCase() === c.original.toLowerCase());
        if (matched) {
          matched.count += 1;
        } else {
          updatedGrammars.push({
            id: "g-es-" + Date.now() + Math.random().toString(36).substring(7),
            originalText: c.original,
            correctedText: c.improved,
            ruleExplanation: c.explanation,
            category: c.category || "Grammar Focus",
            count: 1,
            lastOccurred: new Date().toISOString()
          });
        }
      });

      // Update stats
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedStats = [...state.dailyStats];
      const matchedStat = updatedStats.find(s => s.date === todayStr);
      if (matchedStat) {
        matchedStat.essaysWritten += 1;
      } else {
        updatedStats.push({
          date: todayStr,
          durationMinutes: 20,
          vocabReviewed: 0,
          vocabAdded: 0,
          chatTurns: 0,
          essaysWritten: 1,
          readingsCompleted: 0
        });
      }

      updateState({
        essayLogs: [newEssayLog, ...state.essayLogs],
        grammarErrors: updatedGrammars,
        dailyStats: updatedStats
      });

    } catch (err) {
      console.error(err);
      alert("AI 作文批改失敗，請稍後再試。");
    } finally {
      setEssayLoading(false);
    }
  };

  // Import high-yield words from essay analysis output directly to personal spaced repetition database!
  const handleSaveWordToLibrary = (wordObj: any) => {
    let updatedVocabList = [...state.vocabList];
    const isAlreadySaved = updatedVocabList.some(v => v.word.toLowerCase() === wordObj.word.toLowerCase());

    if (!isAlreadySaved) {
      updatedVocabList.push({
        id: "v-essay-" + Date.now() + Math.random().toString(36).substring(7),
        word: wordObj.word,
        partOfSpeech: wordObj.partOfSpeech || "phrase",
        meaning: wordObj.meaning,
        pronunciation: "/B2 Expression/",
        collocation: wordObj.word + " in context",
        example: wordObj.example,
        interestTopic: essayTopic,
        lastReviewed: new Date().toISOString(),
        nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        intervalDays: 1,
        level: 1,
        successfullyUsedInChat: false
      });
      updateState({ vocabList: updatedVocabList });
    }

    setSavedWordsStatus(prev => ({ ...prev, [wordObj.word]: true }));
  };


  // ----------------------------------------------------
  // SUB-TAB: READING LAB GENERATOR
  // ----------------------------------------------------
  const [selectedInterest, setSelectedInterest] = useState("Psychology");
  const [readingLabLoading, setReadingLabLoading] = useState(false);
  const [readingLabPassage, setReadingLabPassage] = useState<any>(null);
  const [labSummaryText, setLabSummaryText] = useState("");
  const [labSummaryFeedback, setLabSummaryFeedback] = useState("");

  const handleGenerateReadingLab = async () => {
    setReadingLabLoading(true);
    setReadingLabPassage(null);
    setLabSummaryText("");
    setLabSummaryFeedback("");

    try {
      const recentGrammarSlops = state.grammarErrors.slice(0, 2).map(g => g.category);
      const response = await fetch("/api/coach/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interest: selectedInterest,
          vocabWords: state.vocabList.slice(0, 2).map(v => v.word),
          grammarMistakes: recentGrammarSlops
        })
      });

      if (!response.ok) throw new Error("Passage generation error");
      const data = await response.json();
      setReadingLabPassage(data);
    } catch (err) {
      console.error(err);
      alert("閱讀文章生成失敗。");
    } finally {
      setReadingLabLoading(false);
    }
  };

  const handleEvaluateLabSummary = async () => {
    if (!labSummaryText.trim()) return;
    setReadingLabLoading(true);
    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { sender: "coach", text: `Analyze my response and grade how accurately I summarized the passage:\n${readingLabPassage.body}` },
            { sender: "user", text: labSummaryText }
          ],
          topic: readingLabPassage.title
        })
      });
      const data = await response.json();
      setLabSummaryFeedback(data.reply);
    } catch (err) {
      setLabSummaryFeedback("AI 暫時無法完成大意評估。");
    } finally {
      setReadingLabLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="coach-room-root">
      
      {/* Sub Tabs Toggle */}
      <div className="flex border border-zinc-800/80 gap-1 bg-zinc-900/40 p-1.5 rounded-xl max-w-2xl mx-auto">
        <button
          onClick={() => setActiveSubTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === "chat" 
            ? "bg-zinc-300/10 text-zinc-400 border border-zinc-300/20" 
            : "border border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          對話教室 (Chat Coach)
        </button>
        <button
          onClick={() => setActiveSubTab("essay")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === "essay" 
            ? "bg-zinc-300/10 text-zinc-400 border border-zinc-300/20" 
            : "border border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          作文改寫 (Writing Analyzer)
        </button>
        <button
          onClick={() => setActiveSubTab("reading")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === "reading" 
            ? "bg-zinc-300/10 text-zinc-400 border border-zinc-300/20" 
            : "border border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          閱讀實驗室 (Reading Lab)
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* SUB-TAB: CHAT COACH */}
        {activeSubTab === "chat" && (
          <motion.div
            key="chat-coach"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left 2 Columns: Chat Workspace */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[650px] overflow-hidden shadow">
              
              {/* Chat Settings bar */}
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-300 animate-pulse" />
                    選擇口說或對話情境
                  </span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-300/10 px-2 py-0.5 rounded border border-zinc-300/20 font-mono">
                    對話主題: {chatTopic}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => handleSelectScenario(sc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedScenario === sc.id 
                        ? "bg-zinc-100 text-zinc-900 border-zinc-300" 
                        : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Stream Display */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/40">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === "user" 
                      ? "bg-zinc-100 text-zinc-900 rounded-br-none shadow" 
                      : "bg-zinc-800/90 text-zinc-100 rounded-bl-none border border-zinc-700/80"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="block text-[9px] text-zinc-400 mt-2 text-right font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-none p-4 max-w-[80%] flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-zinc-300 animate-spin" />
                      <span className="text-xs text-zinc-400">AI Coach 正在聆聽您的表述並彙整 B2 句子提升建議...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={userChatInput}
                  onChange={(e) => setUserChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  placeholder={SCENARIOS.find(s => s.id === selectedScenario)?.placeholder || "Type your English reply here..."}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-300 transition-colors"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!userChatInput.trim() || chatLoading}
                  className="p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right 1 Column: Gentle Corrections Display (Section 6段落後糾正) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 h-[650px] flex flex-col overflow-hidden shadow">
              <div className="border-b border-zinc-800 pb-3 mb-4">
                <h3 className="font-bold text-zinc-100 flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4 text-zinc-300" />
                  本次對話溫和建議與糾正 (Inline Side Panel)
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  聊天時不打斷你。以下是剛剛偵測到可以再「優化、變更自然」的 1-2 句話，提供 B2 單字升級建議：
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {sessionCorrections.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2 py-12">
                    <Check className="w-8 h-8 text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full" />
                    <p className="text-xs">對話目前進行流暢，無重大語法失誤。</p>
                    <p className="text-[10px] text-zinc-600">（系統每輪最多僅指出最嚴重的 2 個主要盲點）</p>
                  </div>
                ) : (
                  sessionCorrections.map((corr, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx} 
                      className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2 text-xs"
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${corr.isMajor ? "bg-rose-500/20 text-rose-300 border border-rose-500/20" : "bg-amber-500/10 text-amber-300 border border-amber-500/10"}`}>
                        {corr.category} · {corr.isMajor ? "重大語法偏誤" : "B2 自然升級"}
                      </span>
                      <div>
                        <span className="text-zinc-400 block font-semibold">你原先說的：</span>
                        <p className="line-through text-zinc-300 mt-0.5 italic">{corr.original}</p>
                      </div>
                      <div>
                        <span className="text-emerald-400 block font-semibold">推薦說法：</span>
                        <p className="text-emerald-300 font-bold mt-0.5 font-mono text-sm">{corr.improved}</p>
                      </div>
                      <div className="pt-1.5 border-t border-zinc-800 text-zinc-300 leading-relaxed bg-zinc-900/60 p-2 rounded">
                        {corr.explanation}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-TAB: ESSAY REVISION SUITE */}
        {activeSubTab === "essay" && (
          <motion.div
            key="essay-desk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Desk Workspace */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Left Side: Writing Inputs */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <h3 className="font-bold text-zinc-100 flex items-center gap-1.5 text-base">
                  <PenTool className="w-5 h-5 text-zinc-300" />
                  英文寫作升級沙盒 (Writing Desk)
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase">寫作主題 / Topic</label>
                    <input 
                      type="text"
                      value={essayTopic}
                      onChange={(e) => setEssayTopic(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 mt-1 text-sm text-white focus:outline-none focus:border-zinc-300 transition-colors"
                      placeholder="E.g., Why do people procrastinate?"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase">想要著重改進的層面 / Specific Focus</label>
                    <input 
                      type="text"
                      value={essayFocus}
                      onChange={(e) => setEssayFocus(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 mt-1 text-sm text-white focus:outline-none focus:border-zinc-300 transition-colors"
                      placeholder="E.g., Prepositions, Formal verbs, sentence variety"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase">作文內容 / Essay Body (CEFR B1級)</label>
                    <textarea 
                      rows={10}
                      value={essayContent}
                      onChange={(e) => setEssayContent(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 mt-1 text-sm text-white leading-relaxed font-sans focus:outline-none focus:border-zinc-300 transition-colors"
                      placeholder="Please paste or type your draft here (80 - 150 words)..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAnalyzeEssay}
                    disabled={essayLoading || !essayContent.trim()}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-zinc-100/20"
                  >
                    {essayLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    送出給 AI 批改與 B2 優雅重寫
                  </button>
                </div>
              </div>

              {/* Right Side: Analysis Output */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg min-h-[450px]">
                {!analyzedEssay && !essayLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 space-y-2 py-24">
                    <HelpCircle className="w-12 h-12 text-zinc-600" />
                    <h4 className="font-semibold text-zinc-300">尚未批改</h4>
                    <p className="text-xs max-w-xs">在左側輸入您撰寫的英文段落，AI 會立刻生成「最低錯誤修改版」與「進階自然 B2 重寫版」，並對句型提出建議。</p>
                  </div>
                ) : essayLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-24">
                    <RefreshCw className="w-8 h-8 text-zinc-300 animate-spin" />
                    <p className="text-zinc-200 text-sm font-semibold">AI 正在進行句法分析與詞彙代換...</p>
                    <p className="text-xs text-zinc-400">正在生成最低限度改寫、高階重寫與可一鍵存取的單字本表達</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 flex-1 overflow-y-auto max-h-[620px] pr-1"
                  >
                    {/* Score Cards */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">寫作評估量尺 Scores</span>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                          <span className="text-lg font-black text-zinc-300 font-mono">{analyzedEssay.scores.grammar}/10</span>
                          <span className="block text-[9px] text-zinc-500 mt-0.5">文法準確</span>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                          <span className="text-lg font-black text-emerald-400 font-mono">{analyzedEssay.scores.vocabulary}/10</span>
                          <span className="block text-[9px] text-zinc-500 mt-0.5">詞彙豐富</span>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                          <span className="text-lg font-black text-cyan-400 font-mono">{analyzedEssay.scores.cohesion}/10</span>
                          <span className="block text-[9px] text-zinc-500 mt-0.5">句子連貫</span>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-indigo-900/40 to-zinc-950 rounded-xl border border-zinc-300/20 text-center">
                          <span className="text-lg font-black text-zinc-400 font-mono">{analyzedEssay.scores.overall}/10</span>
                          <span className="block text-[9px] text-zinc-300 font-semibold mt-0.5">綜合成績</span>
                        </div>
                      </div>
                    </div>

                    {/* Comparative view */}
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                        <span className="text-xs font-semibold text-amber-400 uppercase">最低修改版本 (只修正基礎錯誤，保留原句風骨)</span>
                        <p className="text-zinc-300 text-sm leading-relaxed">{analyzedEssay.minimumCorrection}</p>
                      </div>

                      <div className="p-4 bg-indigo-950/20 rounded-xl border border-zinc-300/20 space-y-2">
                        <span className="text-xs font-semibold text-zinc-400 uppercase">自然 B2 升級版本 (優雅句構、高階商務詞代換)</span>
                        <p className="text-zinc-100 text-sm leading-relaxed font-medium">{analyzedEssay.naturalB2}</p>
                      </div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800/80 space-y-1">
                        <span className="font-bold text-emerald-400 uppercase block">本次優點 Strengths</span>
                        <p className="text-zinc-300 leading-relaxed">{analyzedEssay.strengths}</p>
                      </div>
                      <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800/80 space-y-1">
                        <span className="font-bold text-rose-300 uppercase block">優先改進項目 Priorities</span>
                        <p className="text-zinc-300 leading-relaxed">{analyzedEssay.priorityImprovements}</p>
                      </div>
                    </div>

                    {/* Specific corrections table */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase block">特定句子文法盲點拆解</span>
                      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                              <th className="p-2.5">原句</th>
                              <th className="p-2.5">優化版</th>
                              <th className="p-2.5">傳統中文解析</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyzedEssay.corrections.map((c: any, idx: number) => (
                              <tr key={idx} className="border-b border-zinc-800/60 hover:bg-zinc-900/40">
                                <td className="p-2.5 text-zinc-400 line-through italic">{c.original}</td>
                                <td className="p-2.5 text-emerald-400 font-bold font-mono">{c.improved}</td>
                                <td className="p-2.5 text-zinc-300">{c.explanation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Import advanced collocations directly to vocab library */}
                    {analyzedEssay.wordsToSave && analyzedEssay.wordsToSave.length > 0 && (
                      <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-300 uppercase block">
                          一鍵匯入此作文中的 B2 進階搭配詞
                        </span>
                        <div className="grid md:grid-cols-2 gap-2">
                          {analyzedEssay.wordsToSave.map((w: any, idx: number) => (
                            <div key={idx} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="font-bold text-zinc-200">{w.word}</span>
                                <span className="block text-[10px] text-zinc-400">{w.meaning}</span>
                              </div>
                              <button
                                onClick={() => handleSaveWordToLibrary(w)}
                                disabled={savedWordsStatus[w.word]}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  savedWordsStatus[w.word] 
                                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                                }`}
                              >
                                {savedWordsStatus[w.word] ? "已存入" : "存入單字本"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* SUB-TAB: READING LAB GENERATOR */}
        {activeSubTab === "reading" && (
          <motion.div
            key="reading-lab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <div>
                <h3 className="font-bold text-zinc-100 flex items-center gap-1.5 text-base">
                  <BookOpen className="w-5 h-5 text-zinc-300" />
                  主題驅動閱讀實驗室 (Reading Generator)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  選擇您感興趣的主題，AI 英文教練會自動提取您今天需要複習的單字與語法盲點，動態生成一篇最完美的 CEFR B1/B2 難度文章。
                </p>
              </div>

              {/* Interest picker */}
              <div className="flex flex-wrap gap-2">
                {["Psychology (心理學)", "Daily Life (日常生活)", "Business & Work (商務工作)", "Technology (科技)", "Art & Literature (藝術文學)"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedInterest(opt.split(" ")[0])}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      selectedInterest === opt.split(" ")[0]
                      ? "bg-zinc-100 text-zinc-900 border-zinc-300"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateReadingLab}
                  disabled={readingLabLoading}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  {readingLabLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  動態生成個人化文章
                </button>
              </div>

              {readingLabPassage && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid lg:grid-cols-2 gap-6 pt-4 border-t border-zinc-800"
                >
                  {/* Left block: Passage */}
                  <div className="space-y-4">
                    <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
                      <span className="text-[10px] uppercase font-mono bg-zinc-300/20 text-zinc-400 px-2 py-0.5 rounded font-bold">
                        {selectedInterest} · B1/B2 Reading
                      </span>
                      <h4 className="text-lg font-extrabold text-zinc-400">{readingLabPassage.title}</h4>
                      <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {readingLabPassage.body}
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">文章精選高難度 B2 字彙</span>
                      <div className="space-y-2">
                        {readingLabPassage.vocabulary.map((v: any, idx: number) => (
                          <div key={idx} className="text-xs border-b border-zinc-800 pb-2 last:border-none">
                            <div className="flex justify-between">
                              <span className="font-bold text-zinc-400">{v.word} ({v.partOfSpeech})</span>
                              <span className="text-zinc-500">{v.pronunciation}</span>
                            </div>
                            <p className="text-zinc-300 font-medium mt-1">釋義: {v.meaning}</p>
                            <p className="text-[10px] text-zinc-400 italic">例句: {v.example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right block: Evaluation summary */}
                  <div className="space-y-4">
                    <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4">
                      <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-zinc-300" />
                        主動輸出：請用自己的話，對本篇文章寫一段 30-50 字的英文摘要
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed italic">
                        提示: {readingLabPassage.understandingPrompts[0]}
                      </p>

                      <textarea
                        rows={4}
                        value={labSummaryText}
                        onChange={(e) => setLabSummaryText(e.target.value)}
                        placeholder="Type your summary here..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-zinc-300 transition-colors"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={handleEvaluateLabSummary}
                          disabled={readingLabLoading || !labSummaryText.trim()}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold"
                        >
                          送出摘要交由 AI 評分
                        </button>
                      </div>

                      {labSummaryFeedback && (
                        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold text-emerald-400 block mb-1">AI 導師點評：</span>
                          {labSummaryFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
