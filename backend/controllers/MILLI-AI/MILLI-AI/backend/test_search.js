import axios from "axios";
import fs from "fs";

async function testSearch(query) {
    try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            }
        });
        const html = res.data;
        fs.writeFileSync("ddg_response.html", html);
        console.log("HTML length:", html.length);
        console.log("Includes class result__snippet:", html.includes("result__snippet"));
        console.log("Includes class result-snippet:", html.includes("result-snippet"));
        console.log("Snippet index:", html.indexOf("snippet"));
    } catch (e) {
        console.error("Search error:", e.message);
    }
}

testSearch("latest news about technology");
