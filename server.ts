import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing in secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

/**
 * 1. AI English Coach Chat with inline segment correction.
 * Returns both a natural follow-up response and 1-2 major corrections (if any).
 */
app.post("/api/coach/chat", async (req, res) => {
  try {
    const { messages, topic, grammarFocus, vocabularyWords } = req.body;
    const ai = getAiClient();

    // Context instructions targeting CEFR B1 -> B2 transition
    const systemInstruction = `You are a supportive, expert AI English Coach. The user is a CEFR B1 level learner striving for B2.
Current Topic: "${topic || "General Discussion"}"
${grammarFocus ? `Grammar Focus: "${grammarFocus}"` : ""}
${vocabularyWords && vocabularyWords.length > 0 ? `Vocabulary/Phrases to encourage: ${vocabularyWords.join(", ")}` : ""}

Guidelines:
1. Speak in clear, natural English suitable for a B1/B2 learner (around 80% simple but 20% natural B2 phrasing).
2. DO NOT interrupt or correct mid-sentence. Respond with a supportive conversational reply, then ask a simple, open-ended question to keep the conversation flowing.
3. Review the user's latest message. If there are mistakes, identify at most 1 or 2 of the most significant errors (such as bad grammar, incorrect collocation, or unnatural Chinese-English phrasing).
4. Provide constructive feedback on how to upgrade it to B2. If there are no errors, leave the 'corrections' array empty. Do not over-correct or mention minor spelling unless it affects meaning.
5. You MUST respond strictly in the defined JSON format.`;

    const modelInput = messages.map((m: any) => `${m.sender === "user" ? "User" : "Coach"}: ${m.text}`).join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `${modelInput}\n\nAnalyze the last User message, formulate your conversational reply, and list any valuable corrections.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Your conversational response continuing the dialogue naturally, ending with an open-ended question."
            },
            corrections: {
              type: Type.ARRAY,
              description: "High-yield corrections for the user's last turn (maximum 2). Leave empty if their sentence was natural.",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "The exact unnatural or incorrect sentence from the user." },
                  improved: { type: Type.STRING, description: "The natural B2 version of the sentence." },
                  explanation: { type: Type.STRING, description: "Brief explanation in Traditional Chinese (繁體中文) explaining why this change is made and how to use the phrase." },
                  category: { type: Type.STRING, description: "One of: Verb Tense, Word Choice, Collocation, Subject-Verb Agreement, Chinglish, Preposition, Article, Sentence Structure." },
                  isMajor: { type: Type.BOOLEAN, description: "True if it seriously blocks comprehension, false if it's a polite B2 naturalness suggestion." }
                },
                required: ["original", "improved", "explanation", "category", "isMajor"]
              }
            }
          },
          required: ["reply", "corrections"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat response." });
  }
});

/**
 * 2. Detailed essay analysis & improvement.
 * Returns: minimum correction, natural B2 version, scores, strengths, priorities, and vocabulary suggestions.
 */
app.post("/api/coach/essay", async (req, res) => {
  try {
    const { essay, topic, focus } = req.body;
    if (!essay) {
      return res.status(400).json({ error: "Essay content is empty." });
    }
    const ai = getAiClient();

    const systemInstruction = `You are an elite English writing examiner. The user is a B1 level student.
Analyze their essay about "${topic || "General Writing"}" focusing on: ${focus || "Grammar, Word Choice, Flow"}.

Provide:
1. Minimum Correction (最低修改版本): Fix ONLY factual grammar errors/typos, keeping their original phrasing, tone, and vocabulary.
2. Natural B2 version (自然 B2 版本): Rewrite the essay using polished collocations, elegant transitions, and varied B2 sentence structures, making it sound professional.
3. Scores (1 to 10 scale) on Grammar, Vocabulary, Cohesion/Transitions, and Overall rating.
4. Strengths (本次優點): Identify specific things they did well.
5. Priority Improvements (建議優先改善項目): Give 1-2 major areas they should focus on.
6. A detailed breakdown of corrections in table format (original vs improved).
7. Advance words or collocations (wordsToSave) suitable for their personal vocabulary notebook.
Explain comments in Traditional Chinese (繁體中文).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `User Essay:\n"""\n${essay}\n"""`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            minimumCorrection: { type: Type.STRING, description: "Corrects only errors, preserving user's voice." },
            naturalB2: { type: Type.STRING, description: "A beautiful rewrite targeting CEFR B2." },
            scores: {
              type: Type.OBJECT,
              properties: {
                grammar: { type: Type.INTEGER },
                vocabulary: { type: Type.INTEGER },
                cohesion: { type: Type.INTEGER },
                overall: { type: Type.INTEGER }
              },
              required: ["grammar", "vocabulary", "cohesion", "overall"]
            },
            strengths: { type: Type.STRING, description: "Written in Traditional Chinese. Praise positive achievements in the essay." },
            priorityImprovements: { type: Type.STRING, description: "Written in Traditional Chinese. Top 1-2 improvements with clear focus." },
            corrections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  explanation: { type: Type.STRING, description: "In Traditional Chinese." },
                  category: { type: Type.STRING }
                },
                required: ["original", "improved", "explanation", "category"]
              }
            },
            wordsToSave: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "E.g., 'put off', 'feel overwhelmed'" },
                  partOfSpeech: { type: Type.STRING },
                  meaning: { type: Type.STRING, description: "Traditional Chinese meaning." },
                  example: { type: Type.STRING, description: "Simple example sentence." }
                },
                required: ["word", "partOfSpeech", "meaning", "example"]
              }
            }
          },
          required: ["minimumCorrection", "naturalB2", "scores", "strengths", "priorityImprovements", "corrections", "wordsToSave"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Essay API error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze essay." });
  }
});

/**
 * 3. Personalized Reading & Shadowing Generation.
 * Tailors a 150-250 word B1/B2 reading passage using recent vocabulary & grammar struggles.
 * Returns understanding output-focused prompts.
 */
app.post("/api/coach/reading", async (req, res) => {
  try {
    const { interest, vocabWords, grammarMistakes } = req.body;
    const ai = getAiClient();

    const systemInstruction = `You are an expert curriculum developer. Generate a personalized English learning card for a CEFR B1 student.
Theme interest: "${interest || "Psychology & Work Productivity"}"
${vocabWords && vocabWords.length > 0 ? `Target vocabulary words to weave in naturally (highlight with *asterisks* in body text): ${vocabWords.join(", ")}` : ""}
${grammarMistakes && grammarMistakes.length > 0 ? `Grammar struggles to correct/demonstrate: ${grammarMistakes.join(", ")}` : ""}

Requirements:
1. Body (body): Write a highly engaging, readable 150-250 word article. Keep it 80% comfortable for B1 but introduce 20% natural B2 flow. Use paragraphs.
2. Listening Transcript (listeningTranscript): Rewrite or adapt the article to sound oral and conversational (with filled pauses like "well,", "you see,", short transitions, and spoken rhythm) to serve as a shadowing tool.
3. Vocabulary (vocabulary): Extract 3-4 key B2 level collocations or words from the text (including those weaved in). Include pronunciation tips (auditory/IPA), meanings in Traditional Chinese, and collocations.
4. Understanding Prompts (understandingPrompts): Write 2 open-ended prompts that encourage the user to write summary reflections or explain viewpoints rather than guessing options (Section 7, Step 4). Give prompts in English.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate a personalized article and shadowing package following instructions.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING, description: "The B1/B2 reading text with target words in *asterisks*." },
            listeningTranscript: { type: Type.STRING, description: "A conversational oral script suitable for listening and shadowing." },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  meaning: { type: Type.STRING, description: "In Traditional Chinese." },
                  pronunciation: { type: Type.STRING, description: "IPA and oral tip, e.g., /ˌəʊvəˈwelmd/" },
                  collocation: { type: Type.STRING, description: "E.g., feel overwhelmed by work" },
                  example: { type: Type.STRING }
                },
                required: ["word", "partOfSpeech", "meaning", "pronunciation", "collocation", "example"]
              }
            },
            understandingPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 open-ended questions inviting the user's opinion or summary."
            }
          },
          required: ["title", "body", "listeningTranscript", "vocabulary", "understandingPrompts"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Reading API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate reading content." });
  }
});

/**
 * 4. Generate Review Quiz.
 * Takes due words and historical mistakes to generate direct active output recall questions (translation, error correction, scenario writing, sentence blanks).
 * No choices, to avoid guessing!
 */
app.post("/api/coach/generate-quiz", async (req, res) => {
  try {
    const { dueWords, dueGrammarPoints } = req.body;
    const ai = getAiClient();

    const systemInstruction = `You are a strict yet helpful spaced-repetition testing system.
Generate a set of exactly 4 active-recall quiz questions (no multiple choice!) based on the provided list of due vocabulary words and common grammar pitfalls.

Provided due vocabulary: ${dueWords && dueWords.length > 0 ? JSON.stringify(dueWords) : "None (provide general psychological or daily-life B2 words)"}
Provided grammar pitfalls: ${dueGrammarPoints && dueGrammarPoints.length > 0 ? JSON.stringify(dueGrammarPoints) : "None (test common pitfalls like subject-verb agreement or prepositions)"}

Question Types allowed:
1. "translation": Traditional Chinese sentence to English, requiring target vocabulary.
2. "completion": A sentence with a blank but NO choices, testing collocations.
3. "correction": A typical incorrect sentence that the user must rewrite correctly.
4. "scenario": A quick scenario prompt asking the user to write a sentence utilizing a specific vocabulary word.

Return Traditional Chinese explanations.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate exactly 4 interactive active-recall questions.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: "translation, completion, correction, or scenario" },
                  target: { type: Type.STRING, description: "The specific word or grammar pitfall being tested" },
                  prompt: { type: Type.STRING, description: "The question prompt, e.g., '請翻譯：我經常因為覺得工作太難而拖延。'" },
                  hint: { type: Type.STRING, description: "Helpful hint, e.g., 'Use the phrase: put off'" },
                  correctAnswer: { type: Type.STRING, description: "The standard B2 correct sentence answer." },
                  explanation: { type: Type.STRING, description: "Explain key collocations or rules in Traditional Chinese." }
                },
                required: ["id", "type", "target", "prompt", "hint", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Quiz API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate review quiz." });
  }
});


// ----------------------------------------------------
// SERVER INTEGRATION (Vite Middleware & Production Serving)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();
