import axios from "axios";

async function testYahoo(query) {
    try {
        console.log(`Searching Yahoo for: ${query}`);
        const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });
        const html = res.data;
        console.log("Yahoo HTML length:", html.length);
        
        // Yahoo search snippets are usually in <div class="compText aGrid"> or similar, or <p class="lh-16">
        // Let's print out if it contains some typical text
        const hasSnippet = html.includes("compText") || html.includes("lh-16") || html.includes("algo");
        console.log("Includes algo/compText/lh-16:", hasSnippet);
        
        // Let's run a simple regex for algo/lh-16/compText
        const regex = /<div class="[^"]*compText[^"]*">([\s\S]*?)<\/div>/g;
        let match;
        const results = [];
        while ((match = regex.exec(html)) !== null && results.length < 5) {
            results.push(match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
        }
        console.log("Results found:", results);
    } catch (e) {
        console.error("Yahoo error:", e.message);
    }
}

testYahoo("who won the t20 world cup 2026");
