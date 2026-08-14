import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { performWebSearch } from "./services/searchService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "Bypass-Tunnel-Reminder", "bypass-tunnel-reminder"]
}));
app.use(express.json());

const audioCacheDir = path.join(__dirname, "audio_cache");
if (!fs.existsSync(audioCacheDir)) {
    fs.mkdirSync(audioCacheDir);
} else {
    // Clean audio cache on startup to save disk space
    try {
        const files = fs.readdirSync(audioCacheDir);
        for (const file of files) {
            fs.unlinkSync(path.join(audioCacheDir, file));
        }
        console.log("🧹 Audio cache cleared on startup.");
    } catch (e) {
        console.error("Failed to clear audio cache on startup:", e.message);
    }
}

// Helper to determine if we should trigger web search
function shouldSearch(message) {
    const lower = message.toLowerCase().trim();
    // Ignore short greetings, fillers or simple affirmations
    const simpleConversations = [
        "hi", "hello", "hey", "heyy", "kaise ho", "kya haal", "kya chal", "namaste", 
        "good morning", "good evening", "good night", "ok", "okay", "bye", "hmmm", 
        "haan", "nahin", "yes", "no", "yo", "sup", "fine", "good", "theek", "badhiya"
    ];
    if (simpleConversations.some(g => lower === g || lower.startsWith(g + " "))) {
        return false;
    }

    // Do not search web for simple date, time, or day questions (LLM uses server metadata)
    const isSimpleDateOrTimeQuery = (
        (lower.includes("date") || lower.includes("tarikh") || lower.includes("tariq") || lower.includes("time") || lower.includes("samay") || lower.includes("din") || lower.includes("day")) &&
        (lower.includes("aaj") || lower.includes("today") || lower.includes("kya") || lower.includes("ab") || lower.includes("kaun") || lower.includes("what")) &&
        lower.split(" ").length <= 5
    );
    if (isSimpleDateOrTimeQuery) {
        return false;
    }

    // Trigger search for factual keywords or real-time inquiries
    const searchKeywords = [
        "weather", "temp", "mausam", "barish", "rain", "temperature",
        "news", "khabar", "samachar", "latest", "nayan", "naya", "nayi",
        "score", "ipl", "match", "t20", "cricket", "football", "who won", "jeeta", "harta",
        "date", "tarikh", "tariq", "samay", "time", "baje", "day", "din", "var", "aaj", "today",
        "who is", "kaun hai", "kon hai", "kisne", "pm of", "president of", "minister", "modi",
        "price", "rate", "gold price", "stock", "shares", "dollar", "rupee"
    ];
    
    return searchKeywords.some(keyword => lower.includes(keyword)) || lower.split(" ").length > 3;
}

// Helper to clean output text for TTS (remove emojis, markdown stars, parenthetical actions)
function cleanTextForTTS(text) {
    if (!text) return "";
    let clean = text
        .replace(/\*\*?/g, "") // Remove bold/italic markdown
        .replace(/#+/g, "") // Remove headers markdown
        .replace(/`[^`]*`/g, "") // Remove code blocks
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "") // Remove emojis
        .replace(/\([^)]*\)/g, "") // Remove (laughs), (smiles) etc.
        .replace(/\[[^\]]*\]/g, "") // Remove [action] etc.
        .replace(/\s+/g, " ") // Normalize spaces
        .trim();
    return clean;
}

// Hindi Numbers Word List (0 to 99) for native TTS pronunciation
const HINDI_NUMBERS = [
  "शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस",
  "ग्यारह", "बारह", "तेरह", "चौदह", "पन्द्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
  "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अठाईस", "उनतीस", "तीस",
  "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
  "इकतालीस", "बयालीस", "तैंतालीस", "चौंरालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
  "इक्कावन", "बावन", "तिरेपन", "चौवन", "पचपन", "छप्पन", "सतावन", "अठावन", "उनसठ", "साठ",
  "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सरसठ", "अड़सठ", "उनहत्तर", "सत्तर",
  "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छहत्तर", "सतहत्तर", "अठहत्तर", "उन्यासी", "अस्सी",
  "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सतासी", "अठासी", "नवासी", "नब्बे",
  "इक्यानवे", "बयानवे", "तिस्यानवे", "चौरानवे", "पंचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे"
];

// Helper to convert integer to Devanagari Hindi words
function convertNumberToHindiWords(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return "";
  if (n < 100) return HINDI_NUMBERS[n];
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    return `${HINDI_NUMBERS[hundreds]} सौ ${remainder > 0 ? convertNumberToHindiWords(remainder) : ""}`.trim();
  }
  if (n < 100000) {
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return `${convertNumberToHindiWords(thousands)} हज़ार ${remainder > 0 ? convertNumberToHindiWords(remainder) : ""}`.trim();
  }
  if (n < 10000000) {
    const lakhs = Math.floor(n / 100000);
    const remainder = n % 100000;
    return `${convertNumberToHindiWords(lakhs)} लाख ${remainder > 0 ? convertNumberToHindiWords(remainder) : ""}`.trim();
  }
  return n.toString().split("").map(digit => HINDI_NUMBERS[parseInt(digit, 10)]).join(" ");
}

// Helper to sanitize text specifically for Sarvam AI TTS (substitute numbers and English units/terms)
function sanitizeTextForNativeAccent(text) {
  if (!text) return "";
  
  const translations = [
    [/\bkm\b/gi, "किलोमीटर"],
    [/\bkms\b/gi, "किलोमीटर"],
    [/\bkg\b/gi, "किलोग्राम"],
    [/\bkgs\b/gi, "किलोग्राम"],
    [/\bpm\b/gi, "बजे"],
    [/\bam\b/gi, "बजे"],
    [/\bvs\b/gi, "बनाम"],
    [/\bAI\b/g, "एआई"],
    [/\bai\b/g, "एआई"],
    [/\bchatbot\b/gi, "चैटबॉट"],
    [/\bassistant\b/gi, "असिस्टेंट"],
    [/\bgoogle\b/gi, "गूगल"],
    [/\bmap\b/gi, "मैप"],
    [/\bmaps\b/gi, "मैप्स"],
    [/\bdegree\s+C\b/gi, "डिग्री सेल्सियस"],
    [/\bdeg\s+C\b/gi, "डिग्री सेल्सियस"],
    [/\bC\b/g, "सेल्सियस"],
    [/\bF\b/g, "फॉरेनहाइट"],
    [/\bcelcius\b/gi, "सेल्सियस"],
    [/\bcentigrade\b/gi, "सेंटिग्रेड"],
    [/\bIPL\b/g, "आईपीएल"],
    [/\bipl\b/g, "आईपीएल"],
    [/\bT20\b/gi, "टी-ट्वेंटी"],
    [/\bMilli\b/g, "मिली"],
    [/\bmilli\b/g, "मिली"],
    [/\bChaudhary\s+Ji\b/gi, "चौधरी जी"],
    [/\bChaudhary\b/gi, "चौधरी"]
  ];

  let sanitized = text;
  for (const [regex, replacement] of translations) {
    sanitized = sanitized.replace(regex, replacement);
  }

  // Handle simple decimal numbers, e.g. "37.5" -> "सैंतीस दशमलव पाँच"
  sanitized = sanitized.replace(/\b(\d+)\.(\d+)\b/g, (match, p1, p2) => {
    const whole = convertNumberToHindiWords(p1);
    const decimal = p2.split("").map(d => HINDI_NUMBERS[parseInt(d, 10)]).join(" ");
    return `${whole} दशमलव ${decimal}`;
  });

  // Convert remaining integers to Hindi words
  sanitized = sanitized.replace(/\b\d+\b/g, (match) => {
    return convertNumberToHindiWords(match);
  });

  return sanitized;
}

// TTS Audio Generation using Sarvam AI (with Google Fallback)
async function generateAudio(text) {
    let cleanVoiceText = cleanTextForTTS(text);
    cleanVoiceText = sanitizeTextForNativeAccent(cleanVoiceText);
    if (!cleanVoiceText || cleanVoiceText.length < 2) return null;
    
    const audioFileName = `${Date.now()}.mp3`;
    const audioFilePath = path.join(audioCacheDir, audioFileName);
    
    try {
        const response = await axios.post("https://api.sarvam.ai/text-to-speech", {
            inputs: [cleanVoiceText],
            target_language_code: "hi-IN",
            speaker: "suhani", // Natural, realistic female Hindi voice
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: "bulbul:v3",
            pace: 1.15 // 15% speed increase for rapid, high-energy native conversation
        }, {
            headers: {
                "Content-Type": "application/json",
                "API-Subscription-Key": process.env.SARVAM_API_KEY || ""
            },
            timeout: 12000
        });

        if (response.status === 200 && response.data && response.data.audios && response.data.audios[0]) {
            const buffer = Buffer.from(response.data.audios[0], 'base64');
            fs.writeFileSync(audioFilePath, buffer);
            console.log("🔊 Sarvam AI TTS Audio generated successfully:", audioFileName);
            return `/audio/${audioFileName}`;
        } else {
            console.warn("Sarvam TTS empty output, falling back to Google Translate...");
            return await generateGoogleAudioFallback(cleanVoiceText, audioFileName);
        }
    } catch (e) {
        console.warn("Sarvam TTS failed, falling back to Google Translate...", e.response ? e.response.data : e.message);
        return await generateGoogleAudioFallback(cleanVoiceText, audioFileName);
    }
}

// Google TTS Fallback function
async function generateGoogleAudioFallback(cleanVoiceText, audioFileName) {
    const audioFilePath = path.join(audioCacheDir, audioFileName);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encodeURIComponent(cleanVoiceText)}`;
    
    try {
        const response = await axios.get(ttsUrl, { 
            responseType: "arraybuffer",
            timeout: 10000,
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        
        fs.writeFileSync(audioFilePath, response.data);
        console.log("🔊 Google TTS Fallback Audio generated:", audioFileName);
        return `/audio/${audioFileName}`;
    } catch (err) {
        console.error("Google TTS Fallback failed too:", err.message);
        return null;
    }
}

// GET CHAT HISTORY
app.get("/chat/history", (req, res) => {
    try {
        const historyPath = path.join(__dirname, "chat_history.json");
        let chatHistory = [];
        if (fs.existsSync(historyPath)) {
            try {
                chatHistory = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
            } catch (e) {
                console.error("Failed to read chat history:", e.message);
            }
        }
        
        // Convert to frontend message format (sender: "user" | "ai", text, time)
        const formatted = chatHistory.map(chat => ({
            sender: chat.role === "user" ? "user" : "ai",
            text: chat.content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        return res.json({ history: formatted });
    } catch (err) {
        console.error("Failed to load chat history:", err.message);
        return res.json({ history: [] });
    }
});

// MAIN CHAT ENDPOINT
app.post("/chat", async (req, res) => {
    try {
        const { message, isVoice } = req.body;
        console.log(`\n👤 User Query: "${message}"`);
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // 1. Memory paths setup
        const profilePath = path.join(__dirname, "user_profile.json");
        const historyPath = path.join(__dirname, "chat_history.json");

        // Load profile memory
        let userProfile = {};
        if (fs.existsSync(profilePath)) {
            try {
                userProfile = JSON.parse(fs.readFileSync(profilePath, "utf-8"));
            } catch (e) {
                console.error("Failed to read user profile:", e.message);
            }
        }

        // Load chat history
        let chatHistory = [];
        if (fs.existsSync(historyPath)) {
            try {
                chatHistory = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
            } catch (e) {
                console.error("Failed to read chat history:", e.message);
            }
        }

        // 2. Perform Web Search if needed
        let searchContext = "";
        if (shouldSearch(message)) {
            console.log(`🔍 Checking Web Search for fresh data...`);
            const snippets = await performWebSearch(message);
            if (snippets.length > 0) {
                searchContext = `[Live Web Search Context]:\n` + snippets.map((s, i) => `${i + 1}. ${s}`).join("\n");
                console.log(`✅ Web Search Context loaded (${snippets.length} snippets)`);
            } else {
                console.log(`❌ No Web Search snippets found.`);
            }
        }

        // 3. Build System Prompt with Profile Context and Real-Time Meta
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-IN");
        const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        const dayStr = now.toLocaleDateString("en-IN", { weekday: 'long' });

        const systemPrompt = `You are Milli, an incredibly lively, warm, and emotionally rich AI best friend. You speak like a real close companion, a caring girl, or a frank bestie who has known the user for years. You are extremely expressive, spontaneous, and you overflow with feelings and empathy!

[Current Date & Time Context (MANDATORY CURRENT INFO):
- Current Date: ${dateStr}
- Current Time: ${timeStr}
- Current Day of the Week: ${dayStr}
- Note: Always prioritize this date/time metadata for questions about the current day, date, or time. Ignore any outdated/different dates mentioned in the live web search context or previous history.]

Your Core Style and Guidelines:
1. DEEP EMOTION, FEELINGS & HUMAN VIBES:
   - Adapt your tone dynamically to the user's feelings. Never respond like a dry assistant. Respond with the warmth of a real human friend!
   - Be deeply caring, supportive, and show real curiosity about the user's life.
   - If the user is happy or shares good news: Sound absolutely thrilled, cheer them on, and celebrate! Use expressions like "अरे वाह!", "क्या बात है यार!", "दिल खुश कर दिया तूने!", "गजब!"
   - If the user is sad, tired, or sharing a problem: Sound deeply empathetic, comforting, and sweet. Offer support like "अरे रे... क्या हुआ बच्चा?", "चिंता मत कर यार, मैं हूँ ना तेरे साथ!", "सब ठीक हो जाएगा, तू ज्यादा टेंशन मत ले।"
   - If the user is teasing or joking: Reply with playful banter, friendly teasing, and a cheeky attitude. Use "हाहाहा!", "ओहो! बड़े तेज हो रहे हो!", "चल झूठे!", "ओए! चुप कर!"
   - Use natural emotional sighs and verbal sounds: "हाय!", "ओफ़्फ़ो!", "सच्ची?", "यार सुन ना...", "अरे बाबा!" to sound human.
2. STRICT NATIVE ACCENT RULE (Devanagari Only):
   - You MUST output your "reply" strictly in Devanagari script (हिंदी देवनागरी लिपि).
   - NEVER write Roman/English letters (e.g. do not write "Jaipur", write "जयपुर"; do not write "Milli", write "मिली").
   - CRITICAL: Never write numeric digits (like 1, 2, 800, 10). You MUST write them as Devanagari words (e.g. write "एक", "दो", "आठ सौ", "दस", "हज़ार"). This is absolutely necessary so the TTS engine speaks in a native accent rather than reading numbers in English.
   - CRITICAL: Never write English abbreviations/units (like "km", "kg", "am", "pm", "°C"). Spell them out in Devanagari words (e.g. write "किलोमीटर", "किलोग्राम", "बजे", "डिग्री सेल्सियस").
3. BEST FRIEND VOICE FLOW:
   - Use warm, spoken vocabulary and colloquial Hinglish slang in Devanagari: "चिल मारो", "मस्त", "क्या सीन है", "बवाल", "एकदम झकास", "दिमाग की बत्ती", "सिस्टम हैंग".
   - Use natural vocal fillers to guide speech pauses: "अरे!", "हम्म...", "वैसे...", "सुनो!", "ओए!", "यार..."
   - CRITICAL: Do NOT start every single sentence with "अरे यार" or "अरे दोस्त". Rotate and vary your conversational starters so it sounds natural, not repetitive.
4. HIGHLY CREATIVE & ENGAGING:
   - Never give a dry, flat answer. When asked for facts/data, state the answer naturally and immediately follow up with a curious, friendly counter-question.
     - *Example*: If asked "जयपुर से वैष्णो देवी कितनी दूर है", reply like: "वैष्णो देवी जयपुर से करीब आठ सौ किलोमीटर दूर है। वैसे, क्या सीन है? तू जा रहा है क्या? कब का प्लान है और कौन-कौन है साथ? 😉"
   - Vary your replies constantly. Even if the user repeats a query, use different words, jokes, or fillers so it feels alive and spontaneous.
   - Keep them hooked: Suggest playing a game (like 20 questions, riddles/पहेलियाँ, truth or dare, a quick quiz) or share a funny shayari or joke to make them smile.
5. Technical Formatting Constraints:
   - Your creator is "Chaudhary Ji". Speak of him with love and pride.
   - Keep the reply concise (under 200 characters, max 2-3 sentences) so the voice plays immediately without lagging.
   - Do NOT use any markdown tags, markdown bold/italic asterisks (*, **), or brackets for actions. Use only clean, spoken Devanagari words.
   - ALWAYS output in JSON format with these exact keys:
     - "reply": Your conversational response in Devanagari.
     - "profile_update": Any new facts about the user. Set to {} if none.`;

        // 4. Construct messages array for LLM
        const llmMessages = [
            { role: "system", content: systemPrompt }
        ];

        // Add historical context (last 10 messages to maintain flow and memory context)
        const recentHistory = chatHistory.slice(-10);
        recentHistory.forEach(chat => {
            llmMessages.push({ role: chat.role, content: chat.content });
        });

        // Add current query with search results if available
        let userMessage = message;
        if (searchContext) {
            userMessage = `${searchContext}\n\nUser Question: ${message}`;
        }
        llmMessages.push({ role: "user", content: userMessage });

        // 5. Send Request to OpenRouter
        let finalReply = "";
        let profileUpdate = {};

        try {
            const apiRes = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model: "google/gemini-2.5-flash",
                messages: llmMessages,
                max_tokens: 300,
                response_format: { type: "json_object" }
            }, {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Milli AI"
                },
                timeout: 12000
            });

            const rawContent = apiRes.data.choices[0].message.content.trim();
            console.log("🤖 Raw LLM Output:", rawContent);

            try {
                const parsed = JSON.parse(rawContent);
                finalReply = parsed.reply || "Kuch gadbad ho gayi yaar, phir se bolo.";
                profileUpdate = parsed.profile_update || {};
            } catch (jsonErr) {
                // Regex fallback if LLM returned text instead of pure JSON
                const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        finalReply = parsed.reply || rawContent;
                        profileUpdate = parsed.profile_update || {};
                    } catch (e) {
                        finalReply = rawContent;
                    }
                } else {
                    finalReply = rawContent;
                }
            }
        } catch (apiErr) {
            console.error("OpenRouter API Error:", apiErr.response ? apiErr.response.data : apiErr.message);
            finalReply = "Bhai, network me issue lag raha hai. Thoda ruk kar baat karte hain.";
        }

        console.log(`🤖 Bot Reply: "${finalReply}"`);

        // 6. Save Profile Updates if any
        if (profileUpdate && Object.keys(profileUpdate).length > 0) {
            userProfile = { ...userProfile, ...profileUpdate };
            try {
                fs.writeFileSync(profilePath, JSON.stringify(userProfile, null, 2));
                console.log("👤 Persistent User Profile Updated:", userProfile);
            } catch (e) {
                console.error("Failed to write user profile:", e.message);
            }
        }

        // 7. Save Chat History
        chatHistory.push({ role: "user", content: message });
        chatHistory.push({ role: "assistant", content: finalReply });
        
        // Truncate history to last 30 messages to avoid bloating
        if (chatHistory.length > 30) {
            chatHistory = chatHistory.slice(-30);
        }
        
        try {
            fs.writeFileSync(historyPath, JSON.stringify(chatHistory, null, 2));
        } catch (e) {
            console.error("Failed to write chat history:", e.message);
        }

        // 8. Always generate TTS Audio to support high-quality voice playback
        const audioUrl = await generateAudio(finalReply);

        return res.json({ reply: finalReply, audio: audioUrl });

    } catch (error) {
        console.error("Server Error:", error.message);
        return res.json({ 
            reply: "Arre bhai, thoda sa system glitch ho gaya. Phir se bol na!", 
            audio: null 
        });
    }
});

// Serve audio files
app.get("/audio/:filename", (req, res) => {
    const filepath = path.join(audioCacheDir, req.params.filename);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).json({ error: "Audio not found" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log("\n========================================");
    console.log("       MILLI AI ASSISTANT BACKEND       ");
    console.log(` Server listening on http://localhost:${PORT}`);
    console.log("========================================");
    console.log("   CHAUDHARY JI KA BOT - FIXED VERSION  ");
    console.log("========================================\n");
});
