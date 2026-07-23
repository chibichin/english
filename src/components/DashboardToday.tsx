import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, BookOpen, MessageSquare, Play, HelpCircle, 
  RotateCcw, CheckCircle, Award, ListTodo, Brain, 
  ChevronRight, ArrowRight, BookMarked, PenTool, Database, 
  Download, Upload, RefreshCw, AlertCircle, Volume2,
  Plus, Filter, Shuffle, Compass, Check
} from "lucide-react";
import { AppState, VocabItem, GrammarErrorMap, ReadingLog } from "../types";

interface DashboardTodayProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardToday({ state, updateState, setActiveTab }: DashboardTodayProps) {
  // Master Theme Repository - 21 diverse topics across 7 domains
  const MASTER_THEME_BANK = [
    // 1. Psychology & Personal Growth
    {
      id: "theme-psych-1",
      title: "Why do people procrastinate?",
      zhTitle: "為什麼人會拖延？克服心理障礙",
      interest: "Psychology",
      vocab: ["put off", "feel overwhelmed", "procrastination", "break a task into smaller steps"],
      grammar: "Although ... but ... (雙連接詞誤用修正)"
    },
    {
      id: "theme-psych-2",
      title: "The power of atomic habits & marginal gains",
      zhTitle: "原子習慣與微小進步的複利效應",
      interest: "Psychology",
      vocab: ["compound effect", "habit stacking", "reduce friction", "marginal gains"],
      grammar: "Used to vs. Be used to + V-ing"
    },
    {
      id: "theme-psych-3",
      title: "Building emotional resilience under pressure",
      zhTitle: "高壓環境下如何培養心理復原力",
      interest: "Psychology",
      vocab: ["bounce back", "coping mechanism", "mindset shift", "emotional regulation"],
      grammar: "In spite of + N vs. Although + Clause"
    },

    // 2. Business & Career
    {
      id: "theme-biz-1",
      title: "How to politely decline requests at work?",
      zhTitle: "如何在職場中禮貌拒絕不合理要求",
      interest: "Business & Work",
      vocab: ["turn down", "respectfully decline", "at the moment", "take on responsibilities"],
      grammar: "Explain something to someone (避免 explain you)"
    },
    {
      id: "theme-biz-2",
      title: "Does remote work truly improve productivity?",
      zhTitle: "遠端混合工作制是否真正提高效率？",
      interest: "Business & Work",
      vocab: ["commute", "distraction", "flexibility", "work-life balance"],
      grammar: "Agree with someone (避免 I am agree)"
    },
    {
      id: "theme-biz-3",
      title: "Navigating career transitions & skill pivots",
      zhTitle: "職場轉型：如何順利轉換跑道與賦能",
      interest: "Business & Work",
      vocab: ["transferable skills", "pivot", "career path", "upskill"],
      grammar: "Consider doing vs. Consider to do"
    },

    // 3. Tech & AI
    {
      id: "theme-tech-1",
      title: "Will AI augment or replace creative work?",
      zhTitle: "生成式 AI 是創造力的助手還是替代者？",
      interest: "Tech & AI",
      vocab: ["automate", "generative AI", "human touch", "augment"],
      grammar: "Discuss something (避免 discuss about)"
    },
    {
      id: "theme-tech-2",
      title: "Digital detox in an hyper-connected world",
      zhTitle: "資訊爆棚年代的數位斷捨離與注意力",
      interest: "Tech & AI",
      vocab: ["screen time", "constant connectivity", "unplug", "mental clarity"],
      grammar: "Prevent someone from doing something"
    },
    {
      id: "theme-tech-3",
      title: "Ethical dilemmas of autonomous systems",
      zhTitle: "自動駕駛與 AI 決策中的道德難題",
      interest: "Tech & AI",
      vocab: ["self-driving", "moral dilemma", "liability", "algorithm"],
      grammar: "It is essential that + S + (should) V"
    },

    // 4. Culture & Travel
    {
      id: "theme-culture-1",
      title: "Exploring artisan coffee culture globally",
      zhTitle: "探索精品咖啡文化與飲食生活哲學",
      interest: "Culture & Travel",
      vocab: ["artisan", "brew method", "social ritual", "specialty coffee"],
      grammar: "Prefer A to B"
    },
    {
      id: "theme-culture-2",
      title: "The subtle art of small talk in Western cultures",
      zhTitle: "打破沉寂：西方文化中的破冰社交技巧",
      interest: "Culture & Travel",
      vocab: ["break the ice", "small talk", "taboo topic", "common ground"],
      grammar: "Look forward to + V-ing"
    },
    {
      id: "theme-culture-3",
      title: "Sustainable tourism: Travel with zero footprint",
      zhTitle: "永續旅遊：不在探索中對當地造成負擔",
      interest: "Culture & Travel",
      vocab: ["carbon footprint", "ecotourism", "off the beaten path", "local community"],
      grammar: "Not only ... but also ..."
    },

    // 5. Health & Lifestyle
    {
      id: "theme-health-1",
      title: "The neuroscience of deep sleep and recovery",
      zhTitle: "深度睡眠與大腦自我清理的科學機制",
      interest: "Health & Lifestyle",
      vocab: ["circadian rhythm", "REM sleep", "sleep hygiene", "recharge"],
      grammar: "Advise someone to do something"
    },
    {
      id: "theme-health-2",
      title: "Mindful eating and the gut-brain connection",
      zhTitle: "正念飲食與腸腦軸線的健康秘密",
      interest: "Health & Lifestyle",
      vocab: ["gut microbiome", "mindful consumption", "processed food", "vitality"],
      grammar: "Suggest that + S + (should) V"
    },
    {
      id: "theme-health-3",
      title: "Minimalism: Living meaningfully with less",
      zhTitle: "極簡生活：擁有的越少，內心越富足",
      interest: "Health & Lifestyle",
      vocab: ["declutter", "intentional living", "materialism", "essentialism"],
      grammar: "Spend time V-ing vs. It takes time to V"
    },

    // 6. Finance & Economics
    {
      id: "theme-finance-1",
      title: "Understanding inflation & purchasing power",
      zhTitle: "日常生活中的通貨膨脹與實質購買力",
      interest: "Finance & Economics",
      vocab: ["purchasing power", "cost of living", "interest rate", "financial buffer"],
      grammar: "High price (避免 expensive price)"
    },
    {
      id: "theme-finance-2",
      title: "The psychology of money & impulse buying",
      zhTitle: "金錢心理學：如何避免情緒化衝動消費",
      interest: "Finance & Economics",
      vocab: ["impulse buying", "opportunity cost", "delayed gratification", "frugal"],
      grammar: "Regret doing vs. Regret to do"
    },
    {
      id: "theme-finance-3",
      title: "Subscription trap: Rethinking recurring expenses",
      zhTitle: "訂閱制陷阱：重新審視日常循環支出",
      interest: "Finance & Economics",
      vocab: ["subscription model", "recurring fee", "opt out", "hidden costs"],
      grammar: "Charge someone money for something"
    },

    // 7. Philosophy & Life
    {
      id: "theme-philo-1",
      title: "Finding intrinsic purpose in modern work",
      zhTitle: "如何在日常工作與生活中尋找內在意義",
      interest: "Philosophy & Life",
      vocab: ["fulfillment", "intrinsic motivation", "burnout", "purpose-driven"],
      grammar: "Make someone do vs. Force someone to do"
    },
    {
      id: "theme-philo-2",
      title: "Solitude vs. Loneliness: The art of being alone",
      zhTitle: "獨處與孤寂的區別：享受高質量的自我時光",
      interest: "Philosophy & Life",
      vocab: ["solitude", "self-reflection", "isolation", "inner peace"],
      grammar: "Used to + V vs. Be used to + V-ing"
    },
    {
      id: "theme-philo-3",
      title: "Critical thinking in the age of misinformation",
      zhTitle: "資訊爆炸時代的批判性思考與判讀力",
      interest: "Philosophy & Life",
      vocab: ["fact-check", "confirmation bias", "media literacy", "source credibility"],
      grammar: "Help (to) do something"
    }
  ];

  // Theme Navigation & Selection States
  const [selectedDomainCategory, setSelectedDomainCategory] = useState<string>("ALL");
  const [shuffleOffset, setShuffleOffset] = useState<number>(0);
  const [customThemes, setCustomThemes] = useState<any[]>([]);
  const [showCustomThemeForm, setShowCustomThemeForm] = useState<boolean>(false);
  const [customTitleInput, setCustomTitleInput] = useState<string>("");
  const [customZhTitleInput, setCustomZhTitleInput] = useState<string>("");
  const [customCategoryInput, setCustomCategoryInput] = useState<string>("Personal Interest");

  // Domain categories for tab filtering
  const DOMAIN_CATEGORIES = [
    { key: "ALL", label: "全部主題" },
    { key: "Psychology", label: "心理學" },
    { key: "Business & Work", label: "職場職涯" },
    { key: "Tech & AI", label: "科技與 AI" },
    { key: "Culture & Travel", label: "文化旅遊" },
    { key: "Health & Lifestyle", label: "健康生活" },
    { key: "Finance & Economics", label: "金錢理財" },
    { key: "Philosophy & Life", label: "哲學思考" }
  ];

  // Daily seed for dynamic daily theme rotation
  const getTodayDateSeed = () => {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  };

  const allAvailableThemes = useMemo(() => {
    return [...customThemes, ...MASTER_THEME_BANK];
  }, [customThemes]);

  const categoryFilteredThemes = useMemo(() => {
    if (selectedDomainCategory === "ALL") return allAvailableThemes;
    return allAvailableThemes.filter(t => t.interest === selectedDomainCategory);
  }, [allAvailableThemes, selectedDomainCategory]);

  // Compute 3 displayed themes based on date seed and shuffle offset
  const seed = getTodayDateSeed() + shuffleOffset;
  const currentDisplayedThemes = useMemo(() => {
    if (categoryFilteredThemes.length <= 3) return categoryFilteredThemes;
    const len = categoryFilteredThemes.length;
    const startIndex = (seed * 3) % len;
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(categoryFilteredThemes[(startIndex + i) % len]);
    }
    return result;
  }, [categoryFilteredThemes, seed]);

  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return currentDisplayedThemes[0]?.id || "theme-psych-1";
  });

  const activeTheme = allAvailableThemes.find(t => t.id === selectedThemeId) || currentDisplayedThemes[0] || MASTER_THEME_BANK[0];

  const handleShuffleThemes = () => {
    setShuffleOffset(prev => prev + 1);
  };

  const handleAddCustomTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitleInput.trim()) return;
    
    const newTheme = {
      id: "custom-theme-" + Date.now(),
      title: customTitleInput.trim(),
      zhTitle: customZhTitleInput.trim() || customTitleInput.trim(),
      interest: customCategoryInput || "Custom Topic",
      vocab: ["key phrase 1", "key phrase 2", "idiomatic usage", "collocation"],
      grammar: "Natural sentence pattern & clear expression"
    };

    setCustomThemes(prev => [newTheme, ...prev]);
    setSelectedThemeId(newTheme.id);
    setCustomTitleInput("");
    setCustomZhTitleInput("");
    setShowCustomThemeForm(false);
  };

  // Guided Session State
  const [activeSessionType, setActiveSessionType] = useState<"none" | "standard" | "quick">("none");
  const [sessionStep, setSessionStep] = useState(1);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");

  // Standard Session generated material
  const [generatedReading, setGeneratedReading] = useState<any>(null);
  const [userReadingSummary, setUserReadingSummary] = useState("");
  const [userReadingOpinion, setUserReadingOpinion] = useState("");
  const [readingSubmitted, setReadingSubmitted] = useState(false);
  const [readingEvaluation, setReadingEvaluation] = useState("");

  // Quiz Review State (Spaced Repetition)
  const [showQuizMode, setShowQuizMode] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizUserAnswer, setQuizUserAnswer] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<any>(null);
  const [quizAnswersSubmitted, setQuizAnswersSubmitted] = useState<Record<string, { answered: string, isCorrect: boolean }>>({});

  // Speaking Shadowing Audio Simulator
  const [shadowingPlaying, setShadowingPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);

  // Compute stats
  const dueVocabCount = state.vocabList.filter(v => {
    const next = new Date(v.nextReview);
    const today = new Date();
    return next <= today && v.level < 5;
  }).length;

  const masteredCount = state.vocabList.filter(v => v.level === 5).length;

  // Change Theme Action
  const handleThemeChange = (id: string) => {
    setSelectedThemeId(id);
    setGeneratedReading(null);
    setReadingSubmitted(false);
    setUserReadingSummary("");
    setUserReadingOpinion("");
  };

  // Import / Export Data
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai_english_coach_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.vocabList && parsed.grammarErrors) {
            updateState(parsed);
            alert("資料庫匯入成功！");
          } else {
            alert("不合法的備份檔案結構。");
          }
        } catch (err) {
          alert("讀取檔案時出錯，請確認是否為標準 JSON 備份檔。");
        }
      };
    }
  };

  // Launch Spaced Repetition Quiz
  const launchDueReview = async () => {
    setQuizLoading(true);
    setShowQuizMode(true);
    setQuizAnswersSubmitted({});
    setCurrentQuizIndex(0);
    setQuizUserAnswer("");
    setQuizChecked(false);

    const dueWords = state.vocabList.filter(v => new Date(v.nextReview) <= new Date() && v.level < 5);
    const dueGrammars = state.grammarErrors.map(g => g.category);

    try {
      const response = await fetch("/api/coach/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueWords: dueWords.map(w => ({ word: w.word, meaning: w.meaning })),
          dueGrammarPoints: dueGrammars
        })
      });

      if (!response.ok) throw new Error("無法連接 AI 生成考題");
      const data = await response.json();
      setQuizQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
      // Fallback questions if API fails or API Key not configured
      setQuizQuestions([
        {
          id: "q-fb-1",
          type: "translation",
          target: "put off",
          prompt: "請翻譯：我今天不想做這個任務，我想拖延到明天。(提示：使用 put off)",
          hint: "I don't want to do this task today, I want to...",
          correctAnswer: "I don't want to do this task today, I want to put it off until tomorrow.",
          explanation: "put off 為拖延之意，受詞如果是代名詞 it 必須放在中間 (put it off)。"
        },
        {
          id: "q-fb-2",
          type: "correction",
          target: "Sentence Structure",
          prompt: "請修正這句語法：I am agree with your decision.",
          hint: "Agree is a verb itself.",
          correctAnswer: "I agree with your decision.",
          explanation: "agree 是動詞，直接說 I agree 即可，不加 be 動詞。"
        }
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  // Submit Quiz Answer
  const handleCheckQuizAnswer = () => {
    const q = quizQuestions[currentQuizIndex];
    const isCorrect = quizUserAnswer.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") === 
                      q.correctAnswer.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") ||
                      quizUserAnswer.length > q.correctAnswer.length * 0.7; // Loose check for sentences

    setQuizAnswersSubmitted(prev => ({
      ...prev,
      [q.id]: { answered: quizUserAnswer, isCorrect }
    }));

    // Perform state update in Vocab database for spaced repetition
    const matchedVocab = state.vocabList.find(v => v.word.toLowerCase() === q.target.toLowerCase());
    if (matchedVocab) {
      const currentLevel = matchedVocab.level;
      const nextLevel = isCorrect ? Math.min(5, currentLevel + 1) : Math.max(1, currentLevel - 1);
      const nextInterval = Math.pow(2, nextLevel); // Simple doubling interval

      const updatedVocabList = state.vocabList.map(v => {
        if (v.id === matchedVocab.id) {
          return {
            ...v,
            level: nextLevel,
            intervalDays: nextInterval,
            lastReviewed: new Date().toISOString(),
            nextReview: new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString()
          };
        }
        return v;
      });

      // Update study stats
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedStats = [...state.dailyStats];
      const matchedStat = updatedStats.find(s => s.date === todayStr);
      if (matchedStat) {
        matchedStat.vocabReviewed += 1;
      } else {
        updatedStats.push({
          date: todayStr,
          durationMinutes: 5,
          vocabReviewed: 1,
          vocabAdded: 0,
          chatTurns: 0,
          essaysWritten: 0,
          readingsCompleted: 0
        });
      }

      updateState({ vocabList: updatedVocabList, dailyStats: updatedStats });
    }

    setQuizChecked(true);
  };

  // Launch Standard Guided Session
  const handleLaunchStandardSession = async () => {
    setActiveSessionType("standard");
    setSessionStep(1);
    setSessionLoading(true);
    setSessionError("");
    setGeneratedReading(null);
    setReadingSubmitted(false);
    setUserReadingSummary("");
    setUserReadingOpinion("");

    try {
      const response = await fetch("/api/coach/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interest: activeTheme.interest,
          vocabWords: activeTheme.vocab,
          grammarMistakes: [activeTheme.grammar]
        })
      });

      if (!response.ok) throw new Error("無法連接 AI 生成課程素材");
      const data = await response.json();
      setGeneratedReading(data);
    } catch (err: any) {
      console.error(err);
      setSessionError("連線至 AI 英文教練失敗。已載入本地離線複習主題。");
      // Fallback structured data
      setGeneratedReading({
        title: activeTheme.title,
        body: "Many B1 learners often *put off* their homework because they *feel overwhelmed* by complex tasks. Psychologists call this *procrastination*. However, the secret is simply to *break a task into smaller steps* to get started. Even though it feels tough to begin, starting is the only way to succeed.",
        listeningTranscript: "You know, we often put off our work because we feel overwhelmed. It's procrastination. But, the key is to break a task into smaller steps. Just start!",
        vocabulary: [
          { word: "put off", partOfSpeech: "verb", meaning: "拖延；延後", pronunciation: "/pʊt ɒf/", collocation: "put off doing something", example: "Don't put off your duties." },
          { word: "feel overwhelmed", partOfSpeech: "phrase", meaning: "感到壓力過大、不知所措", pronunciation: "/fiːl ˌəʊvəˈwelmd/", collocation: "feel overwhelmed by deadlines", example: "I feel overwhelmed with work." }
        ],
        understandingPrompts: [
          "1. Summarize why B1 learners put off tasks based on the passage.",
          "2. What is your own opinion about tackling procrastination?"
        ]
      });
    } finally {
      setSessionLoading(false);
    }
  };

  // Evaluate Reading Summary Answer
  const handleSubmitReadingSummary = async () => {
    if (!userReadingSummary.trim() && !userReadingOpinion.trim()) return;
    setSessionLoading(true);
    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { sender: "coach", text: `Read this text and respond to these prompts:\n${generatedReading.body}\nPrompts:\n1. ${generatedReading.understandingPrompts[0]}\n2. ${generatedReading.understandingPrompts[1]}` },
            { sender: "user", text: `Summary: ${userReadingSummary}\nMy Opinion: ${userReadingOpinion}` }
          ],
          topic: activeTheme.title
        })
      });
      const data = await response.json();
      setReadingEvaluation(data.reply);
      setReadingSubmitted(true);

      // Save reading to library logs
      const newReadingLog: ReadingLog = {
        id: "rl-" + Date.now(),
        title: generatedReading.title,
        body: generatedReading.body,
        listeningTranscript: generatedReading.listeningTranscript,
        interest: activeTheme.interest,
        userSummary: userReadingSummary,
        userOpinion: userReadingOpinion,
        studiedAt: new Date().toISOString()
      };

      // Add weaved vocab words to Vocab Vault if not already present
      let updatedVocabs = [...state.vocabList];
      generatedReading.vocabulary.forEach((v: any) => {
        if (!updatedVocabs.some(item => item.word.toLowerCase() === v.word.toLowerCase())) {
          updatedVocabs.push({
            id: "v-" + Date.now() + Math.random().toString(36).substring(7),
            word: v.word,
            partOfSpeech: v.partOfSpeech,
            meaning: v.meaning,
            pronunciation: v.pronunciation,
            collocation: v.collocation,
            example: v.example,
            interestTopic: activeTheme.interest,
            lastReviewed: new Date().toISOString(),
            nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            intervalDays: 1,
            level: 1,
            successfullyUsedInChat: false
          });
        }
      });

      // Increment stats
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedStats = [...state.dailyStats];
      const matchedStat = updatedStats.find(s => s.date === todayStr);
      if (matchedStat) {
        matchedStat.readingsCompleted += 1;
        matchedStat.vocabAdded += generatedReading.vocabulary.length;
      } else {
        updatedStats.push({
          date: todayStr,
          durationMinutes: 15,
          vocabReviewed: 0,
          vocabAdded: generatedReading.vocabulary.length,
          chatTurns: 0,
          essaysWritten: 0,
          readingsCompleted: 1
        });
      }

      updateState({
        readingLogs: [newReadingLog, ...state.readingLogs],
        vocabList: updatedVocabs,
        dailyStats: updatedStats
      });

    } catch (err) {
      setReadingEvaluation("AI 評估失敗，但已為您記錄此篇閱讀筆記於個人資料庫中。");
      setReadingSubmitted(true);
    } finally {
      setSessionLoading(false);
    }
  };

  // Shadowing Text-to-Speech Speech Synthesis Simulator
  const handleShadowingSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      if (shadowingPlaying) {
        window.speechSynthesis.cancel();
        setShadowingPlaying(false);
      } else {
        setShadowingPlaying(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = audioSpeed;
        utterance.onend = () => setShadowingPlaying(false);
        utterance.onerror = () => setShadowingPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("您的瀏覽器不支援語音合成播放，請使用 Chrome / Edge 體驗。");
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-8" id="dashboard-today-root">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-300/10 text-zinc-400 text-[11px] font-medium border border-zinc-300/20">
            <Sparkles className="w-3 h-3 text-zinc-300" />
            今日學習任務已備妥
          </div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-white">你好，English Learner!</h1>
          <p className="text-zinc-400 max-w-xl text-xs leading-relaxed">
            系統已根據您的盲點地圖、學習喜好與遺忘曲線調度好了今日的主題與待複習詞彙。
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-2.5 relative z-10">
          <button 
            onClick={() => setActiveTab("coach")}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-900 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-zinc-100/10"
          >
            <MessageSquare className="w-4 h-4" />
            進入 Coach 對話教室
          </button>
          
          <button 
            onClick={handleExport}
            title="備份我的所有單字與學習記錄"
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 transition-colors text-zinc-300 border border-zinc-800 flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            備份
          </button>

          <label className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 transition-colors text-zinc-300 border border-zinc-800 flex items-center gap-1.5 text-xs font-medium cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            還原
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* REVIEW QUIZ OVERLAY MODE */}
        {showQuizMode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden text-zinc-100"
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowQuizMode(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 transition-colors text-xs font-semibold cursor-pointer"
              >
                結束複習
              </button>
            </div>

            {quizLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
                <p className="text-zinc-300 text-xs">正在根據您的歷史錯題與過期單字，動態組裝複習內容...</p>
                <p className="text-[11px] text-zinc-500 font-mono">（杜絕多選題，確認您在無提示下能主動輸出）</p>
              </div>
            ) : quizQuestions.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 space-y-3">
                <CheckCircle className="w-10 h-10 text-zinc-400 mx-auto" />
                <p className="text-sm">今天沒有到期的單字或文法項目！</p>
                <button 
                  onClick={() => setShowQuizMode(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  回首頁
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-zinc-400 font-medium text-xs uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-zinc-400" />
                  <span>間隔複習造句測試 ({currentQuizIndex + 1} / {quizQuestions.length})</span>
                </div>

                <div className="p-5 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase bg-zinc-800 border border-zinc-700/60 text-zinc-300 px-2 py-0.5 rounded">
                      {quizQuestions[currentQuizIndex].type === "translation" ? "中翻英" : 
                       quizQuestions[currentQuizIndex].type === "correction" ? "文法改錯" : 
                       quizQuestions[currentQuizIndex].type === "completion" ? "搭配詞克漏" : "造句測試"}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">考點: {quizQuestions[currentQuizIndex].target}</span>
                  </div>
                  <h3 className="text-base font-medium mt-3 text-white leading-relaxed">
                    {quizQuestions[currentQuizIndex].prompt}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 italic">提示: {quizQuestions[currentQuizIndex].hint}</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">您的答案 (請手寫輸入完整句子，不靠選項猜測)</label>
                  <textarea
                    rows={3}
                    disabled={quizChecked}
                    value={quizUserAnswer}
                    onChange={(e) => setQuizUserAnswer(e.target.value)}
                    placeholder="請在此輸入英文完整答句..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-zinc-700 transition-colors text-xs placeholder:text-zinc-600"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] text-zinc-500 leading-normal">
                    * 答對會增加該單字或文法的熟練度 (1-5階)，答錯將自動縮短下一次的複習時間。
                  </div>

                  {!quizChecked ? (
                    <button
                      onClick={handleCheckQuizAnswer}
                      disabled={!quizUserAnswer.trim()}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 font-semibold rounded-xl text-xs whitespace-nowrap cursor-pointer shadow-sm"
                    >
                      驗證答案
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      {currentQuizIndex < quizQuestions.length - 1 ? (
                        <button
                          onClick={() => {
                            setCurrentQuizIndex(prev => prev + 1);
                            setQuizUserAnswer("");
                            setQuizChecked(false);
                          }}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs whitespace-nowrap cursor-pointer"
                        >
                          下一題
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowQuizMode(false)}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          完成今天複習
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {quizChecked && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-zinc-900 rounded-xl border border-zinc-800/80 space-y-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {quizAnswersSubmitted[quizQuestions[currentQuizIndex].id]?.isCorrect ? (
                        <span className="text-zinc-300 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-zinc-400" /> 優秀！答案與 AI 推薦方向符合。
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-zinc-500" /> 建議修正，請參考推薦 B2 版本。
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 font-medium block">參考最自然 B2 答案：</span>
                      <p className="font-mono text-zinc-200 font-medium text-xs mt-1 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 select-all">
                        {quizQuestions[currentQuizIndex].correctAnswer}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 font-medium block">AI 考點重點說明：</span>
                      <p className="text-zinc-400 mt-1 leading-relaxed">
                        {quizQuestions[currentQuizIndex].explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* GUIDED SESSION OVERLAY MODE */}
        {activeSessionType !== "none" && !showQuizMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl relative text-zinc-100"
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setActiveSessionType("none")}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 transition-colors text-[11px] font-semibold cursor-pointer"
              >
                中斷課程
              </button>
            </div>

            <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-6">
              <span className="font-medium text-zinc-300 text-xs uppercase tracking-wider">
                {activeSessionType === "standard" ? "標準學習模式 (15-25 分鐘)" : "快速保持習慣模式 (5-8 分鐘)"}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s} 
                    className={`w-8 h-1 rounded ${s <= sessionStep ? "bg-zinc-400" : "bg-zinc-800"}`}
                  />
                ))}
              </div>
            </div>

            {sessionLoading && !generatedReading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
                <p className="text-zinc-400 text-xs">正在根據您的興趣與盲點，生成今日專屬情境教材與 shadowing 語句...</p>
              </div>
            )}

            {/* STEP 1: PRE-LEARN VOCABULARY */}
            {sessionStep === 1 && generatedReading && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-zinc-400" />
                    第一步：預習核心表達方式
                  </h2>
                  <p className="text-zinc-500 text-xs mt-1">
                    以下 2-3 個高頻實用表達會立即出現在接下來的閱讀、Shadowing 與對話中。
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {generatedReading.vocabulary.map((vocab: any, idx: number) => (
                    <div key={idx} className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-zinc-200 font-semibold text-sm">{vocab.word}</span>
                        <span className="text-[9px] font-mono uppercase bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400">{vocab.partOfSpeech}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">發音: {vocab.pronunciation}</p>
                      <p className="text-zinc-300 text-xs font-semibold">釋義: {vocab.meaning}</p>
                      <p className="text-xs text-zinc-400">搭配: {vocab.collocation}</p>
                      <p className="text-xs text-zinc-500 italic">例句: {vocab.example}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => setSessionStep(2)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    下一步：情境短文閱讀 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SCENARIO READING / INPUT */}
            {sessionStep === 2 && generatedReading && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    第二步：情境主題短篇輸入 (Reading)
                  </h2>
                  <p className="text-zinc-500 text-xs mt-1">
                    閱讀以下與興趣關聯的文章。標註為 *星號* 的單字為剛剛預習的核心表達，請注意它們在文中的自然用法。
                  </p>
                </div>

                <div className="p-5 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">{generatedReading.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-xs whitespace-pre-wrap">
                    {generatedReading.body}
                  </p>
                </div>

                <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      口說與聽力 Shadowing 素材播放
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-zinc-500">語速：</label>
                      <select 
                        value={audioSpeed} 
                        onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                        className="bg-zinc-800 text-[11px] text-zinc-300 rounded border border-zinc-700 px-1.5 py-0.5 focus:outline-none cursor-pointer"
                      >
                        <option value={0.8}>0.8x (慢速)</option>
                        <option value={1.0}>1.0x (常速)</option>
                        <option value={1.2}>1.2x (流暢)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 bg-zinc-900/40 p-3 rounded leading-relaxed border border-zinc-800/40">
                    {generatedReading.listeningTranscript}
                  </p>
                  <button
                    onClick={() => handleShadowingSpeech(generatedReading.listeningTranscript)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${shadowingPlaying ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300" : "bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/50"}`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {shadowingPlaying ? "停止播放" : "跟讀播放 (Shadowing)"}
                  </button>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => setSessionStep(3)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    下一步：理解與摘要 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: UNDERSTANDING & SUMMARY */}
            {sessionStep === 3 && generatedReading && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-zinc-400" />
                    第三步：無選項主動思考 (理解與摘要)
                  </h2>
                  <p className="text-zinc-500 text-xs mt-1">
                    杜絕容易猜答案的選擇題，請用自己的話，嘗試用簡單的一至兩句英文回答問題 or 重述大意。
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-300">問題 1 (摘要): {generatedReading.understandingPrompts[0]}</h4>
                    <textarea
                      rows={3}
                      value={userReadingSummary}
                      onChange={(e) => setUserReadingSummary(e.target.value)}
                      placeholder="請用英文輸入簡短的大意摘要..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-300">問題 2 (個人觀點): {generatedReading.understandingPrompts[1]}</h4>
                    <textarea
                      rows={3}
                      value={userReadingOpinion}
                      onChange={(e) => setUserReadingOpinion(e.target.value)}
                      placeholder="請表達您對此主題的個人看法..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {readingSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 space-y-2 text-xs text-zinc-400"
                  >
                    <span className="font-semibold text-zinc-200 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-zinc-400" /> AI 導師已收到您的回答，並提供了以下回饋：
                    </span>
                    <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{readingEvaluation}</p>
                  </motion.div>
                )}

                <div className="flex justify-between pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => setSessionStep(2)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 rounded-lg text-xs cursor-pointer text-zinc-300"
                  >
                    返回閱讀
                  </button>
                  
                  {!readingSubmitted ? (
                    <button
                      onClick={handleSubmitReadingSummary}
                      disabled={sessionLoading || (!userReadingSummary.trim() && !userReadingOpinion.trim())}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {sessionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      送出答案並由 AI 分析
                    </button>
                  ) : (
                    <button
                      onClick={() => setSessionStep(4)}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      下一步：對話與實戰口說 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: INTERACTIVE CHAT INVITATION */}
            {sessionStep === 4 && (
              <div className="space-y-6">
                <div className="text-center py-6 space-y-4 max-w-lg mx-auto">
                  <MessageSquare className="w-10 h-10 text-zinc-400 mx-auto" />
                  <h2 className="text-base font-semibold text-zinc-200">
                    與 AI Coach 進行情境 Role Play
                  </h2>
                  <p className="text-zinc-400 text-xs">
                    為了確認您能否在沒有提示的新情境中，主動說出或寫出學過的英文，我們將進入
                    <span className="text-zinc-200 font-semibold"> 專屬對話教室</span>，實際使用新學到的表達。
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setActiveSessionType("none");
                      setActiveTab("coach");
                    }}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    進入 AI 對話教室 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Themes & Activities */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Daily Themes & Launchers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Daily Themes Panel */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5 text-zinc-400" />
                    今日多元推薦主題 (Daily Rotating Themes)
                  </h2>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                    每日自動輪播
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  共收錄 20+ 跨領域主題庫，每日零點自動切換新主題，亦可依領域篩選或換一批。
                </p>
              </div>

              {/* Top Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffleThemes}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="隨機切換下一組主題"
                >
                  <Shuffle className="w-3.5 h-3.5 text-zinc-400" />
                  換一批
                </button>
                <button
                  onClick={() => setShowCustomThemeForm(!showCustomThemeForm)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  自訂主題
                </button>
              </div>
            </div>

            {/* Domain Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {DOMAIN_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSelectedDomainCategory(cat.key);
                    setShuffleOffset(0);
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    selectedDomainCategory === cat.key
                      ? "bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm"
                      : "bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:border-zinc-750"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Custom Theme Inline Form */}
            {showCustomThemeForm && (
              <form onSubmit={handleAddCustomTheme} className="p-4 bg-zinc-900/80 border border-zinc-750 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    自訂想要學習的主題或文章議題
                  </span>
                  <span className="text-[10px] text-zinc-500">輸入後 AI 會自動為您產生專屬情境教材</span>
                </div>
                <div className="grid md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="英文主題 (例如：Quantum Computing in Daily Life)"
                    value={customTitleInput}
                    onChange={(e) => setCustomTitleInput(e.target.value)}
                    className="md:col-span-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                    required
                  />
                  <input
                    type="text"
                    placeholder="中文翻譯或註解 (例如：量子運算在生活中的應用)"
                    value={customZhTitleInput}
                    onChange={(e) => setCustomZhTitleInput(e.target.value)}
                    className="md:col-span-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                  <select
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="md:col-span-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="Personal Interest">個人自訂 Personal Interest</option>
                    <option value="Tech & AI">科技與 AI</option>
                    <option value="Business & Work">職場職涯</option>
                    <option value="Culture & Travel">文化旅遊</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomThemeForm(false)}
                    className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    建立並開始學習
                  </button>
                </div>
              </form>
            )}

            {/* Displayed Themes Grid */}
            <div className="grid md:grid-cols-3 gap-3">
              {currentDisplayedThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                    selectedThemeId === theme.id 
                    ? "bg-zinc-900 border-zinc-600 text-white shadow-sm ring-1 ring-zinc-500/30" 
                    : "bg-zinc-900/20 border-zinc-900/80 hover:border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono bg-zinc-850 border border-zinc-750 px-1.5 py-0.5 rounded text-zinc-300 uppercase">
                        {theme.interest}
                      </span>
                      {selectedThemeId === theme.id && (
                        <span className="text-[9px] bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded font-bold">
                          已選擇
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-xs leading-snug">{theme.title}</h4>
                    <p className="text-[11px] text-zinc-400">{theme.zhTitle}</p>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-3 font-mono flex items-center justify-between border-t border-zinc-850/60 pt-2">
                    <span className="flex items-center gap-1">
                      <Brain className="w-3 h-3 text-zinc-400" />
                      {theme.vocab.length} 個高頻表達
                    </span>
                    <span className="text-zinc-500">預習盲點</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Launchers Box */}
            <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-zinc-400">當前選擇主題：{activeTheme.zhTitle}</span>
                <p className="text-[11px] text-zinc-500">文法重點：{activeTheme.grammar}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleLaunchStandardSession}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  開始學習
                </button>
                <button
                  onClick={() => {
                    setActiveSessionType("quick");
                    setSessionStep(1);
                    // Generate minimal quick content
                    setGeneratedReading({
                      title: "Quick Vocabulary Booster",
                      body: "Remember to put off procrastination and focus on tiny actions.",
                      listeningTranscript: "Just do it!",
                      vocabulary: [
                        { word: "put off", partOfSpeech: "verb", meaning: "拖延", pronunciation: "/pʊt ɒf/", collocation: "put off work", example: "Don't put off tasks." }
                      ],
                      understandingPrompts: ["1. Write one sentence using 'put off'."]
                    });
                  }}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-800 cursor-pointer"
                >
                  5分鐘極速
                </button>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Due Vocabulary Banner */}
          <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-zinc-850 text-zinc-400 border border-zinc-800">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-zinc-200 flex items-center gap-2 text-xs uppercase tracking-wider">
                  SRS 間隔複習單字本
                  <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded border border-zinc-700/60 font-mono font-medium">
                    {dueVocabCount} 筆待複習
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 max-w-md">
                  根據您答題的速度與熟練度，系統將自動調度今天到期需加強的詞彙。
                </p>
              </div>
            </div>

            <button
              onClick={launchDueReview}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold shadow-sm cursor-pointer whitespace-nowrap"
            >
              啟動手寫複習
            </button>
          </div>

          {/* Quick Checklist */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ListTodo className="w-4 h-4 text-zinc-400" />
                今日任務一覽 (Today's Checklist)
              </h2>
              <p className="text-[11px] text-zinc-500">完成一項即自動推進今日學習進度。</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${dueVocabCount === 0 ? "border-zinc-500 bg-zinc-800 text-zinc-300" : "border-zinc-800 text-transparent"}`}>
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">複習到期單字與片語</h4>
                    <p className="text-[11px] text-zinc-500">{dueVocabCount > 0 ? `尚有 ${dueVocabCount} 個過期表達需要您手寫造句回想` : "今日進度已完成！"}</p>
                  </div>
                </div>
                {dueVocabCount > 0 && (
                  <button onClick={launchDueReview} className="text-xs text-zinc-400 font-medium hover:underline cursor-pointer">
                    去複習 &rarr;
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-zinc-850"></div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">文法盲點地圖修正測試</h4>
                    <p className="text-[11px] text-zinc-500">練習您近期常犯的文法錯誤類型 ({activeTheme.grammar})</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab("coach")} className="text-xs text-zinc-400 font-medium hover:underline cursor-pointer">
                  去練習 &rarr;
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-zinc-850"></div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">與 AI 英文教練進行情境對話</h4>
                    <p className="text-[11px] text-zinc-500">使用核心字彙 {activeTheme.vocab.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab("coach")} className="text-xs text-zinc-400 font-medium hover:underline cursor-pointer">
                  去聊天 &rarr;
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Learning Discipline & Motivation Summary */}
        <div className="space-y-6">
          
          {/* Active stats */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 text-zinc-100 space-y-4 shadow-sm">
            <h3 className="font-semibold text-zinc-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-zinc-400" />
              個人學習統計與目標
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850">
                <span className="text-xl font-bold text-zinc-300 font-mono">
                  {state.vocabList.length}
                </span>
                <span className="block text-[10px] text-zinc-500 mt-1">單字庫總量</span>
              </div>
              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850">
                <span className="text-xl font-bold text-zinc-400 font-mono">
                  {masteredCount}
                </span>
                <span className="block text-[10px] text-zinc-500 mt-1">已完美掌握 (L5)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">今日學習循環進度</span>
                <span className="text-zinc-300 font-semibold">100%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="bg-zinc-300 h-full w-[100%] rounded-full" />
              </div>
            </div>

            <div className="pt-1 border-t border-zinc-950">
              <span className="text-[10px] text-zinc-500 leading-normal block">
                * 系統熟練度判定標準：只有當您能不看選項主動手寫造句、在 Conversation 中成功使用且隔天複習不遺忘，才會判定為熟練掌握。
              </span>
            </div>
          </div>

          {/* Quick Suggest Inbox */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="font-semibold text-zinc-100 text-xs flex items-center gap-1.5 font-display">
              <Database className="w-3.5 h-3.5 text-zinc-300" />
              稍後探索 (Explore Inbox)
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              在日常生活中突然想到的單字或句子，可以先記錄在 Library 裡的「稍後探索收件箱」，等複習時再讓 AI 導師為您造句並加入單字本。
            </p>
            <button 
              onClick={() => setActiveTab("library")} 
              className="text-xs text-zinc-300 hover:underline font-semibold block pt-1"
            >
              開啟我的收件箱 &rarr;
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
