import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function test() {
    try {
        console.log("Testing with max_tokens set...");
        const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-2.5-flash",
            messages: [
                { role: "user", content: "Hello, who are you? Respond in Hindi in one line." }
            ],
            max_tokens: 150
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        console.log("Success with Gemini 2.5 Flash! Reply:", res.data.choices[0].message.content);
    } catch (err) {
        console.error("Gemini 2.5 Flash Error:", err.response ? err.response.data : err.message);
    }

    try {
        console.log("\nTesting with Llama 3 8B Instruct Free...");
        const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "meta-llama/llama-3-8b-instruct:free",
            messages: [
                { role: "user", content: "Hello, who are you? Respond in Hindi in one line." }
            ],
            max_tokens: 150
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        console.log("Success with Llama 3 8B! Reply:", res.data.choices[0].message.content);
    } catch (err) {
        console.error("Llama 3 8B Error:", err.response ? err.response.data : err.message);
    }
}
test();
