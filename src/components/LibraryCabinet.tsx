import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, BookOpen, AlertCircle, Bookmark, Inbox, 
  Trash2, Plus, Sparkles, Check, RefreshCw, 
  ExternalLink, Calendar, HelpCircle, PenTool
} from "lucide-react";
import { AppState, VocabItem, GrammarErrorMap, ExploreInboxItem } from "../types";

interface LibraryCabinetProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

export default function LibraryCabinet({ state, updateState }: LibraryCabinetProps) {
  const [activeCabinet, setActiveCabinet] = useState<"vocab" | "grammar" | "essay" | "explore">("vocab");

  // ----------------------------------------------------
  // SUB-CABINET: VOCABULARY VAULT
  // ----------------------------------------------------
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabFilterTopic, setVocabFilterTopic] = useState("all");
  const [vocabFilterLevel, setVocabFilterLevel] = useState("all");

  const [customVocabWord, setCustomVocabWord] = useState("");
  const [customVocabMeaning, setCustomVocabMeaning] = useState("");
  const [customVocabPos, setCustomVocabPos] = useState("noun");
  const [customVocabColloc, setCustomVocabColloc] = useState("");
  const [customVocabExample, setCustomVocabExample] = useState("");
  const [vocabFormOpen, setVocabFormOpen] = useState(false);

  const handleAddCustomVocab = () => {
    if (!customVocabWord.trim() || !customVocabMeaning.trim()) return;

    const newItem: VocabItem = {
      id: "v-custom-" + Date.now(),
      word: customVocabWord.trim(),
      partOfSpeech: customVocabPos,
      meaning: customVocabMeaning.trim(),
      pronunciation: "/Custom Input/",
      collocation: customVocabColloc.trim() || `${customVocabWord} in context`,
      example: customVocabExample.trim() || "Enter an example sentence to solidify memory.",
      interestTopic: "User Manual",
      lastReviewed: new Date().toISOString(),
      nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      intervalDays: 1,
      level: 1,
      successfullyUsedInChat: false
    };

    updateState({ vocabList: [newItem, ...state.vocabList] });

    // Reset Form
    setCustomVocabWord("");
    setCustomVocabMeaning("");
    setCustomVocabPos("noun");
    setCustomVocabColloc("");
    setCustomVocabExample("");
    setVocabFormOpen(false);
  };

  const handleDeleteVocab = (id: string) => {
    if (confirm("確定要刪除此單字嗎？")) {
      updateState({ vocabList: state.vocabList.filter(v => v.id !== id) });
    }
  };

  const filteredVocab = state.vocabList.filter(v => {
    const matchesSearch = v.word.toLowerCase().includes(vocabSearch.toLowerCase()) || 
                          v.meaning.includes(vocabSearch);
    const matchesTopic = vocabFilterTopic === "all" || v.interestTopic === vocabFilterTopic;
    const matchesLevel = vocabFilterLevel === "all" || v.level.toString() === vocabFilterLevel;
    return matchesSearch && matchesTopic && matchesLevel;
  });


  // ----------------------------------------------------
  // SUB-CABINET: EXPLORE INBOX (稍後探索)
  // ----------------------------------------------------
  const [newExploreItemText, setNewExploreItemText] = useState("");
  const [newExploreItemNote, setNewExploreItemNote] = useState("");
  const [exploreLoadingId, setExploreLoadingId] = useState<string | null>(null);

  const handleAddExploreItem = () => {
    if (!newExploreItemText.trim()) return;
    const newItem: ExploreInboxItem = {
      id: "ex-" + Date.now(),
      text: newExploreItemText.trim(),
      note: newExploreItemNote.trim(),
      status: "pending",
      createdAt: new Date().toISOString()
    };
    updateState({ exploreInbox: [newItem, ...state.exploreInbox] });
    setNewExploreItemText("");
    setNewExploreItemNote("");
  };

  const handleAskCoachAboutExplore = async (item: ExploreInboxItem) => {
    setExploreLoadingId(item.id);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
      
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { sender: "coach", text: "You are an English coach. A student asks about this vocabulary/phrase. Explain its exact meaning, core collocations, and provide an illustrative CEFR B2 example sentence." },
            { sender: "user", text: `What is the meaning and usage of "${item.text}"? Note from user: ${item.note || "none"}` }
          ],
          topic: "Vocabulary Inquiry"
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();

      // Automatically promote to Vocab Vault
      const replyStr = data.reply || "AI provided no reply.";
      const promotedVocab: VocabItem = {
        id: "v-prom-" + Date.now(),
        word: item.text,
        partOfSpeech: "phrase",
        meaning: `AI: ${replyStr.slice(0, 80)}...`,
        pronunciation: "/Checked/",
        collocation: `Use: ${item.text}`,
        example: replyStr,
        interestTopic: "Inbox Promo",
        lastReviewed: new Date().toISOString(),
        nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        intervalDays: 1,
        level: 1,
        successfullyUsedInChat: false
      };

      const updatedInbox = state.exploreInbox.map(i => {
        if (i.id === item.id) return { ...i, status: "resolved" as const };
        return i;
      });

      updateState({
        exploreInbox: updatedInbox,
        vocabList: [promotedVocab, ...state.vocabList]
      });

      alert(`已透過 AI 生成解析，並將 "${item.text}" 存入您的單字本中！詳細例句已保存在單字本。`);
    } catch (err) {
      console.error(err);
      alert("無法連接 AI 教練進行解析。");
    } finally {
      setExploreLoadingId(null);
    }
  };

  const handleDismissExplore = (id: string) => {
    const updated = state.exploreInbox.map(i => {
      if (i.id === id) return { ...i, status: "dismissed" as const };
      return i;
    });
    updateState({ exploreInbox: updated });
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6" id="library-cabinet-root">
      
      {/* Sidebar Nav Cabinets */}
      <div className="space-y-2 bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-2xl h-fit shadow-sm">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-2 mb-2 font-display">庫與資料夾</span>
        <button
          onClick={() => setActiveCabinet("vocab")}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCabinet === "vocab" 
            ? "bg-zinc-300/10 text-zinc-400 border border-zinc-300/20" 
            : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          個人單字與片語庫 ({state.vocabList.length})
        </button>
        <button
          onClick={() => setActiveCabinet("grammar")}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCabinet === "grammar" 
            ? "bg-zinc-300/10 text-zinc-400 border border-zinc-300/20" 
            : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          個人文法錯誤盲點地圖 ({state.grammarErrors.length})
        </button>
        <button
          onClick={() => setActiveCabinet("essay")}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCabinet === "essay" 
            ? "bg-zinc-300/10 text-zinc-400 border border-zinc-300/20" 
            : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
          }`}
        >
          <PenTool className="w-4 h-4" />
          歷次寫作修改紀錄 ({state.essayLogs.length})
        </button>
        <button
          onClick={() => setActiveCabinet("explore")}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCabinet === "explore" 
            ? "bg-zinc-300/10 text-zinc-400 border border-zinc-300/20" 
            : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
          }`}
        >
          <Inbox className="w-4 h-4" />
          稍後探索收件箱 ({state.exploreInbox.filter(i => i.status === "pending").length})
        </button>

        <div className="pt-4 border-t border-zinc-950 text-[11px] text-zinc-500 leading-relaxed px-2">
          寫作、對話、閱讀中捕獲的所有盲點皆會在此自動歸檔，供 SRS 間隔複習引擎隨時調度。
        </div>
      </div>

      {/* Main Panel cabinet workspace */}
      <div className="lg:col-span-3 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 shadow-sm min-h-[500px]">
        
        <AnimatePresence mode="wait">
          
          {/* CABINET: VOCABULARY VAULT */}
          {activeCabinet === "vocab" && (
            <motion.div
              key="vocab-vault"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Filter tools */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                    placeholder="搜尋單字、片語或中文含義..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-300 transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={vocabFilterTopic}
                    onChange={(e) => setVocabFilterTopic(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all">所有來源主題</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Daily Life">Daily Life</option>
                    <option value="Business & Work">Business & Work</option>
                  </select>

                  <select
                    value={vocabFilterLevel}
                    onChange={(e) => setVocabFilterLevel(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all">所有熟練度</option>
                    <option value="1">Level 1 (看過)</option>
                    <option value="2">Level 2 (認得)</option>
                    <option value="3">Level 3 (能回想)</option>
                    <option value="4">Level 4 (能造句)</option>
                    <option value="5">Level 5 (已掌握)</option>
                  </select>

                  <button
                    onClick={() => setVocabFormOpen(!vocabFormOpen)}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    手動新增單字
                  </button>
                </div>
              </div>

              {/* Manual Vocab Form */}
              {vocabFormOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3"
                >
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">手動建立複習項目</h4>
                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-zinc-400 font-medium">單字或短語 *</label>
                      <input 
                        type="text" 
                        value={customVocabWord}
                        onChange={(e) => setCustomVocabWord(e.target.value)}
                        placeholder="E.g., leverage" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mt-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-medium">中文含意 *</label>
                      <input 
                        type="text" 
                        value={customVocabMeaning}
                        onChange={(e) => setCustomVocabMeaning(e.target.value)}
                        placeholder="E.g., 槓桿作用、充分利用" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mt-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-medium">詞性</label>
                      <select 
                        value={customVocabPos}
                        onChange={(e) => setCustomVocabPos(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mt-1 text-zinc-300"
                      >
                        <option value="noun">noun</option>
                        <option value="verb">verb</option>
                        <option value="adjective">adjective</option>
                        <option value="phrase">phrase</option>
                        <option value="phrasal verb">phrasal verb</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-zinc-400 font-medium">常用搭配詞 (Collocation)</label>
                      <input 
                        type="text" 
                        value={customVocabColloc}
                        onChange={(e) => setCustomVocabColloc(e.target.value)}
                        placeholder="E.g., leverage resources" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mt-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-medium">自定義或出處例句 (Example)</label>
                      <input 
                        type="text" 
                        value={customVocabExample}
                        onChange={(e) => setCustomVocabExample(e.target.value)}
                        placeholder="E.g., We should leverage our strengths." 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mt-1 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button onClick={() => setVocabFormOpen(false)} className="px-3 py-1.5 bg-zinc-900 text-zinc-400 rounded-lg">
                      取消
                    </button>
                    <button onClick={handleAddCustomVocab} className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg font-bold">
                      確認新增
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Vocabulary Grid list */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredVocab.length === 0 ? (
                  <div className="col-span-2 text-center text-zinc-500 py-12">
                    找不到符合篩選條件的單字，嘗試調整關鍵字或新增一個。
                  </div>
                ) : (
                  filteredVocab.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all relative overflow-hidden group"
                    >
                      {/* Side color stripe depending on Mastery level */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                        item.level === 5 ? "bg-emerald-500" : 
                        item.level === 4 ? "bg-zinc-300" : 
                        item.level === 3 ? "bg-cyan-500" : 
                        item.level === 2 ? "bg-amber-500" : "bg-rose-500"
                      }`} />

                      <div className="space-y-2 pl-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-zinc-100 font-mono flex items-center gap-1.5">
                              {item.word}
                              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-semibold italic">
                                {item.partOfSpeech}
                              </span>
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">發音/讀法: {item.pronunciation}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-zinc-300/10 text-zinc-400 px-2 py-0.5 rounded border border-zinc-300/20">
                              熟練: L{item.level}
                            </span>
                            <button 
                              onClick={() => handleDeleteVocab(item.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-zinc-400 font-semibold block">中文含意：</span>
                          <p className="text-sm text-zinc-200 mt-0.5 font-medium">{item.meaning}</p>
                        </div>

                        <div>
                          <span className="text-xs text-zinc-400 font-semibold block">核心常見搭配 Collocation：</span>
                          <p className="text-xs text-indigo-200 mt-0.5 font-semibold bg-indigo-950/20 px-2 py-1 rounded border border-zinc-300/10">
                            {item.collocation}
                          </p>
                        </div>

                        {item.example && (
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-semibold">自訂或出處句子：</span>
                            <p className="text-xs text-zinc-300 italic leading-relaxed">{item.example}</p>
                          </div>
                        )}
                      </div>

                      <div className="pl-2 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          複習時間: {new Date(item.nextReview).toLocaleDateString()}
                        </span>
                        <span>來源: {item.interestTopic}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* CABINET: GRAMMAR ERROR MAP */}
          {activeCabinet === "grammar" && (
            <motion.div
              key="grammar-map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-zinc-300" />
                  英文文法盲點地圖 (Grammar Error Map)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  每當您在 AI 對話教室、寫作批改沙盒中犯下文法錯誤時，系統會自動歸納並累計頻率，幫助您了解自己的寫作與口說語法盲點。
                </p>
              </div>

              <div className="space-y-3">
                {state.grammarErrors.length === 0 ? (
                  <div className="text-center text-zinc-500 py-12">
                    目前乾淨無瑕！一旦您在學習中出現語法盲點，AI 導師會立刻在此為您做診斷與收錄。
                  </div>
                ) : (
                  state.grammarErrors.map((err) => (
                    <div 
                      key={err.id} 
                      className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800/80 space-y-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 font-mono border border-rose-500/20 font-bold uppercase">
                          {err.category}
                        </span>
                        <span className="text-zinc-400 font-medium">
                          此類偏誤已出現累計：
                          <span className="text-rose-400 font-mono font-black text-sm"> {err.count} </span> 
                          次
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-xs pt-1.5">
                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                          <span className="text-zinc-500 font-semibold block uppercase">您的原始偏誤 sentence:</span>
                          <p className="line-through text-zinc-300 mt-1 italic font-mono text-xs">{err.originalText}</p>
                        </div>
                        <div className="p-3 bg-indigo-950/20 rounded-xl border border-zinc-300/10">
                          <span className="text-zinc-300 font-bold block uppercase">推薦修正與升級版 correct:</span>
                          <p className="text-zinc-400 font-bold mt-1 font-mono text-sm">{err.correctedText}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-850 text-xs text-zinc-300 leading-relaxed">
                        <span className="font-bold text-zinc-200 block mb-1">傳統中文語法解析與避免原則：</span>
                        {err.ruleExplanation}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* CABINET: ESSAY LOGS ARCHIVE */}
          {activeCabinet === "essay" && (
            <motion.div
              key="essay-archive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-1.5">
                  <PenTool className="w-5 h-5 text-zinc-300" />
                  歷次寫作修辭與比較存檔
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  在此查看您曾撰寫的文章，追蹤平均句子長度的延伸、連接詞的多樣性、以及與 B2 高級潤色版本的寫法差異。
                </p>
              </div>

              <div className="space-y-4">
                {state.essayLogs.length === 0 ? (
                  <div className="text-center text-zinc-500 py-12">
                    尚無寫作記錄。請至「Coach 導師教室」的寫作 Desk 撰寫您的第一篇短文吧！
                  </div>
                ) : (
                  state.essayLogs.map((essay) => (
                    <div 
                      key={essay.id} 
                      className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-200">主題: {essay.topic}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                            寫作時間: {new Date(essay.studiedAt).toLocaleDateString()} · CEFR 綜合評估: B2-
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="bg-zinc-300/10 text-zinc-400 font-mono font-semibold px-2 py-0.5 rounded">
                            文法 {essay.scores.grammar}/10
                          </span>
                          <span className="bg-emerald-500/10 text-emerald-300 font-mono font-semibold px-2 py-0.5 rounded">
                            詞彙 {essay.scores.vocabulary}/10
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-zinc-500 font-bold block uppercase">您當時寫的原文：</span>
                        <p className="text-zinc-300 bg-zinc-900 p-3 rounded-xl italic leading-relaxed">{essay.originalContent}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-zinc-300 font-bold block uppercase">AI 推薦 B2 完美改寫版：</span>
                        <p className="text-zinc-200 bg-indigo-950/10 border border-zinc-300/10 p-3 rounded-xl font-medium leading-relaxed">
                          {essay.naturalB2}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-zinc-900/60 rounded-xl">
                          <span className="font-bold text-emerald-400 block mb-1">本次優點</span>
                          <p className="text-zinc-300 leading-normal">{essay.strengths}</p>
                        </div>
                        <div className="p-3 bg-zinc-900/60 rounded-xl">
                          <span className="font-bold text-amber-400 block mb-1">未來優先改進點</span>
                          <p className="text-zinc-300 leading-normal">{essay.priorityImprovements}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* CABINET: EXPLORE INBOX (稍後探索) */}
          {activeCabinet === "explore" && (
            <motion.div
              key="explore-inbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-1.5">
                  <Inbox className="w-5 h-5 text-zinc-300" />
                  防分心稍後探索收件箱 (Explore Inbox)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  在工作或觀看英文影片時突然想到的俚語、片語或生字？先隨手丟進這個收件箱。完成今日預定學習任務後，再點擊「由 AI Coach 說明並存入單字本」，保障今日學習不跑題。
                </p>
              </div>

              {/* Form to add exploration query */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase">隨手記錄靈感</h4>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400">想查的單字、片語或句子 *</label>
                    <input
                      type="text"
                      value={newExploreItemText}
                      onChange={(e) => setNewExploreItemText(e.target.value)}
                      placeholder="E.g., dynamic pricing, call it a day"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mt-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400">當前情境筆記 (在哪聽到的？)</label>
                    <input
                      type="text"
                      value={newExploreItemNote}
                      onChange={(e) => setNewExploreItemNote(e.target.value)}
                      placeholder="E.g., 今天開會聽同事說的，好像是停止工作的意思..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mt-1 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleAddExploreItem}
                    disabled={!newExploreItemText.trim()}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 rounded-xl text-xs font-bold"
                  >
                    存入待查收件箱
                  </button>
                </div>
              </div>

              {/* Inbox lists */}
              <div className="space-y-2">
                {state.exploreInbox.filter(i => i.status === "pending").length === 0 ? (
                  <div className="text-center text-zinc-500 py-12 text-xs">
                    待處理收件箱已全部清空！您現在可以專注於今日主要課題。
                  </div>
                ) : (
                  state.exploreInbox.filter(i => i.status === "pending").map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <span className="text-zinc-300 font-extrabold text-sm font-mono block">{item.text}</span>
                        <p className="text-zinc-300 font-medium">{item.note || "無情境註記"}</p>
                        <span className="text-[10px] text-zinc-500 font-mono block">記錄時間: {new Date(item.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAskCoachAboutExplore(item)}
                          disabled={exploreLoadingId === item.id}
                          className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                        >
                          {exploreLoadingId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          由 AI Coach 說明並加入單字本
                        </button>
                        <button
                          onClick={() => handleDismissExplore(item.id)}
                          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-xs"
                        >
                          略過
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

    </div>
  );
}
