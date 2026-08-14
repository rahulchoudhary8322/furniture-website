import axios from "axios";
import fs from "fs";

async function testYahooParser() {
    try {
        const query = "who won the t20 world cup 2026";
        const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });
        const html = res.data;
        
        // Let's write Yahoo HTML to a file so we can inspect it or extract from it
        fs.writeFileSync("yahoo_response.html", html);
        
        // Find divs with class "algo" or "dd algo"
        // Let's write a regex that matches algo divs
        const algoRegex = /<div class="[^"]*algo[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
        let match;
        const results = [];
        
        // Let's try to extract h3 titles and compText snippets
        // Typically: <h3 class="title"><a href="URL" ...>TITLE</a></h3>
        // and <div class="compText aGrid">SNIPPET</div> or <p class="lh-16">SNIPPET</p>
        const titleRegex = /<h3[^>]*>([\s\S]*?)<\/h3>/g;
        const linkRegex = /href="([^"]+)"/i;
        const snippetRegex = /(?:<div class="compText[^"]*">|<p class="lh-16">|<span class="[^"]*fc-2nd[^"]*">)([\s\S]*?)(?:<\/div>|<\/p>|<\/span>)/g;
        
        // Let's search for snippet pattern directly:
        const genericSnippetRegex = /(?:<div class="compText[^"]*">|<p class="lh-16">|<span class="[^"]*lh-16[^"]*">)([\s\S]*?)(?:<\/div>|<\/p>|<\/span>)/g;
        
        let snippetMatch;
        const snippets = [];
        while ((snippetMatch = genericSnippetRegex.exec(html)) !== null && snippets.length < 5) {
            let snip = snippetMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
            if (snip.length > 20 && !snip.includes("Compare Prices") && !snip.includes("Tickets On Sale")) {
                snippets.push(snip);
            }
        }
        
        console.log("Extracted snippets:");
        console.log(snippets);
    } catch (e) {
        console.error("Yahoo parse error:", e.message);
    }
}

testYahooParser();
