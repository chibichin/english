import { VocabItem, GrammarErrorMap, ReadingLog, EssayLog, ChatLog, ExploreInboxItem, DailyStudyStat } from "./types";

// Helper to get ISO date relative to today
const getRelativeDateISO = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
};

export const SEED_VOCAB: VocabItem[] = [
  {
    id: "v-1",
    word: "put off",
    partOfSpeech: "phrasal verb",
    meaning: "拖延；延期",
    pronunciation: "/pʊt ɒf/",
    collocation: "put off doing something",
    example: "I often put off my work because it feels too difficult to start.",
    originPhrase: "I often delay my work because I feel it is too difficult.",
    correctedOrigin: "I often put off my work because it feels too difficult to start.",
    interestTopic: "Psychology",
    lastReviewed: getRelativeDateISO(-1),
    nextReview: getRelativeDateISO(0), // due today!
    intervalDays: 1,
    level: 3,
    successfullyUsedInChat: true,
  },
  {
    id: "v-2",
    word: "feel overwhelmed",
    partOfSpeech: "phrase",
    meaning: "感到不知所措、壓力過大",
    pronunciation: "/fiːl ˌəʊvəˈwelmd/",
    collocation: "feel overwhelmed by heavy workload",
    example: "When I see twenty emails in my inbox, I feel overwhelmed.",
    originPhrase: "My workload makes me feel very high pressure and cannot handle.",
    correctedOrigin: "My heavy workload makes me feel overwhelmed.",
    interestTopic: "Psychology",
    lastReviewed: getRelativeDateISO(-2),
    nextReview: getRelativeDateISO(0), // due today!
    intervalDays: 2,
    level: 2,
    successfullyUsedInChat: false,
  },
  {
    id: "v-3",
    word: "even though",
    partOfSpeech: "conjunction",
    meaning: "雖然、儘管 (引導讓步子句)",
    pronunciation: "/ˈiːvn ðəʊ/",
    collocation: "even though it was raining",
    example: "Even though I knew the task was important, I put it off until midnight.",
    interestTopic: "Daily Life",
    lastReviewed: getRelativeDateISO(-4),
    nextReview: getRelativeDateISO(2), // due in 2 days
    intervalDays: 6,
    level: 4,
    successfullyUsedInChat: true,
  },
  {
    id: "v-4",
    word: "break a task into smaller steps",
    partOfSpeech: "phrase",
    meaning: "將任務拆解為較小的步驟",
    pronunciation: "/breɪk ə tɑːsk ˈɪntuː ˈsmɔːlə steps/",
    collocation: "break a project into smaller steps",
    example: "If you break a task into smaller steps, it becomes much easier to tackle.",
    interestTopic: "Business & Work",
    lastReviewed: getRelativeDateISO(-1),
    nextReview: getRelativeDateISO(0), // due today!
    intervalDays: 1,
    level: 1,
    successfullyUsedInChat: false,
  },
  {
    id: "v-5",
    word: "procrastination",
    partOfSpeech: "noun",
    meaning: "拖延症；拖延行為",
    pronunciation: "/prəʊˌkræstɪˈneɪʃn/",
    collocation: "chronic procrastination",
    example: "Overcoming procrastination requires changing how we handle negative feelings.",
    interestTopic: "Psychology",
    lastReviewed: getRelativeDateISO(-3),
    nextReview: getRelativeDateISO(0), // due today!
    intervalDays: 3,
    level: 3,
    successfullyUsedInChat: false,
  }
];

export const SEED_GRAMMAR: GrammarErrorMap[] = [
  {
    id: "g-1",
    originalText: "I am agree with your opinion.",
    correctedText: "I agree with your opinion.",
    ruleExplanation: "'agree' 是一個一般動詞，而不是形容詞，因此直接說 'I agree'。不可使用動詞 be ('am') 搭配一般動詞原形。",
    category: "Sentence Structure",
    count: 3,
    lastOccurred: getRelativeDateISO(-2),
  },
  {
    id: "g-2",
    originalText: "I want to explain you this grammar rule.",
    correctedText: "I want to explain this grammar rule to you.",
    ruleExplanation: "動詞 'explain' 的用法是 explain something to someone，而不能像 tell/show 那樣直接接雙賓語 explain you something。",
    category: "Collocation",
    count: 2,
    lastOccurred: getRelativeDateISO(-1),
  },
  {
    id: "g-3",
    originalText: "Although I was tired, but I still did my homework.",
    correctedText: "Although I was tired, I still did my homework.",
    ruleExplanation: "在英文中，Although (雖然) 和 but (但是) 只能擇一使用，不能同時出現在同一個複合句中（中式英文常見錯誤）。",
    category: "Chinglish",
    count: 4,
    lastOccurred: getRelativeDateISO(-3),
  }
];

export const SEED_READINGS: ReadingLog[] = [
  {
    id: "r-1",
    title: "Why Do People Procrastinate?",
    body: "Many people think that chronic *procrastination* is just a sign of laziness or poor time management. However, psychologists have found that it is actually a way of managing negative emotions. When we face a task that makes us *feel overwhelmed*, anxious, or insecure, our brain wants to protect us. As a result, we decide to *put off* the work to find temporary relief in easier activities. To overcome this, instead of waiting for perfect motivation, we should *break a task into smaller steps* and focus on simply getting started. *Even though* it feels difficult at first, taking action is the only cure for feeling stuck.",
    listeningTranscript: "You know, a lot of people think procrastination is just about being lazy. But actually, psychologists tell us it's more about emotions. When you look at a task and feel overwhelmed, your brain is like, 'Whoa, let's avoid this.' So, you put off the work to feel better right now. The trick, you see, is to break that task into tiny, simple steps. Even though it's hard to start, just taking one small action changes everything.",
    interest: "Psychology",
    userSummary: "Procrastination is not laziness. It is emotional avoidance. We should break tasks down to start easily.",
    userOpinion: "I agree with this because I always play phone games when I feel my reports are too complex.",
    studiedAt: getRelativeDateISO(-3),
  }
];

export const SEED_ESSAYS: EssayLog[] = [
  {
    id: "e-1",
    topic: "The Benefits of Remote Work",
    originalContent: "I think remote work has many benefits. First, it can save much times of transportation. Working from home is very comfortable, although sometimes I feel lonely. Also, workers can arrange their own schedule. But some bosses don't trust employees are working, this makes managers anxious.",
    minimumCorrection: "I think remote work has many benefits. First, it can save a lot of travel time. Working from home is very comfortable, although sometimes I feel lonely. Also, workers can arrange their own schedules. However, some bosses don't trust that their employees are working, which makes managers anxious.",
    naturalB2: "I believe remote work offers numerous advantages. Primarily, it eliminates lengthy commutes, saving employees valuable time. While telecommuting provides a flexible and comfortable environment, it can occasionally lead to feelings of isolation. Additionally, working remotely empowers professionals to design their own schedules. Nonetheless, a lack of trust from employers regarding productivity remains a challenge, often causing managerial anxiety.",
    scores: {
      grammar: 6,
      vocabulary: 6,
      cohesion: 5,
      overall: 6,
    },
    strengths: "文章結構清晰，明確表達了遠距工作的優缺點。能主動使用雖然 (although) 引導讓步子句。",
    priorityImprovements: "1. 增加用字多樣性，避免重複使用 simple words (如 many, very)。\n2. 改善句子連接，but 不適合作為正式寫作的句首，建議改用 However 或 Nonetheless。",
    corrections: [
      {
        original: "save much times of transportation",
        improved: "save a lot of travel time",
        explanation: "time 作為時間時是不可數名詞，不可加 s；transportation 是指交通工具或運輸系統，通勤時間常用 commute 或 travel time 表示。",
        category: "Noun Countability"
      },
      {
        original: "But some bosses",
        improved: "However, some employers",
        explanation: "在學術或商業寫作中，But 不適合放在句首，用 However 加逗號更顯得連貫與專業，且 employers 比 bosses 更正式。",
        category: "Sentence Connection"
      }
    ],
    wordsToSave: [
      {
        word: "eliminate lengthy commutes",
        partOfSpeech: "phrase",
        meaning: "消除冗長通勤",
        example: "Remote working eliminates lengthy commutes, allowing for better sleep."
      },
      {
        word: "empower professionals",
        partOfSpeech: "phrase",
        meaning: "賦予專業人士自主權",
        example: "The new flexible hours empower professionals to manage their families better."
      }
    ],
    studiedAt: getRelativeDateISO(-5),
  }
];

export const SEED_CHATS: ChatLog[] = [
  {
    id: "c-1",
    topic: "Why do people procrastinate?",
    startedAt: getRelativeDateISO(-1),
    messages: [
      { id: "msg-1", sender: "coach", text: "Hello! Today let's talk about our topic: 'Why do people procrastinate?'. Have you ever experienced putting off something important because you felt overwhelmed?", timestamp: getRelativeDateISO(-1) },
      { id: "msg-2", sender: "user", text: "Yes, I often delay my work because I am agree that it is very hard.", timestamp: getRelativeDateISO(-1) },
      { id: "msg-3", sender: "coach", text: "That is totally normal! I see you used 'delay my work'. An even more natural phrasal verb is 'put off my work'. What kind of tasks do you usually put off?", timestamp: getRelativeDateISO(-1) }
    ],
    corrections: [
      {
        original: "I am agree that it is very hard",
        improved: "I agree that it is very hard",
        explanation: "正如前述，agree 是動詞，直接說 I agree 即可，不用搭配 am。",
        category: "Sentence Structure",
        isMajor: true,
      }
    ]
  }
];

export const SEED_EXPLORE: ExploreInboxItem[] = [
  {
    id: "ex-1",
    text: "vicious cycle",
    note: "從拖延的文章中想到的詞，中文意思是惡性循環，想查如何造句",
    status: "pending",
    createdAt: getRelativeDateISO(-2),
  },
  {
    id: "ex-2",
    text: "incentive",
    note: "工作開會聽到的詞，意思是動機/獎勵，想加入單字庫複習",
    status: "pending",
    createdAt: getRelativeDateISO(-1),
  }
];

export const SEED_STATS: DailyStudyStat[] = [
  {
    date: getRelativeDateISO(-4).split("T")[0],
    durationMinutes: 20,
    vocabReviewed: 5,
    vocabAdded: 2,
    chatTurns: 0,
    essaysWritten: 0,
    readingsCompleted: 1,
  },
  {
    date: getRelativeDateISO(-3).split("T")[0],
    durationMinutes: 35,
    vocabReviewed: 10,
    vocabAdded: 3,
    chatTurns: 2,
    essaysWritten: 0,
    readingsCompleted: 1,
  },
  {
    date: getRelativeDateISO(-2).split("T")[0],
    durationMinutes: 15,
    vocabReviewed: 8,
    vocabAdded: 1,
    chatTurns: 0,
    essaysWritten: 0,
    readingsCompleted: 0,
  },
  {
    date: getRelativeDateISO(-1).split("T")[0],
    durationMinutes: 45,
    vocabReviewed: 12,
    vocabAdded: 2,
    chatTurns: 4,
    essaysWritten: 1,
    readingsCompleted: 0,
  }
];
