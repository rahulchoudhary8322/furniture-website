import axios from "axios";

// Helper to decode HTML entities
function decodeHtmlEntities(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&ndash;/g, "-")
        .replace(/&mdash;/g, "-")
        .replace(/&nbsp;/g, " ");
}

/**
 * Perform a web search using Yahoo Search scraping
 * @param {string} query Search query
 * @returns {Promise<string[]>} Array of text snippets
 */
export async function performWebSearch(query) {
    try {
        const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
            },
            timeout: 5000
        });

        const html = res.data;
        const genericSnippetRegex = /(?:<div class="compText[^"]*">|<p class="lh-16">|<span class="[^"]*lh-16[^"]*">)([\s\S]*?)(?:<\/div>|<\/p>|<\/span>)/g;
        
        let match;
        const snippets = [];
        while ((match = genericSnippetRegex.exec(html)) !== null && snippets.length < 5) {
            let snippetText = match[1]
                .replace(/<[^>]*>/g, "") // remove nested html tags
                .replace(/\s+/g, " ") // normalize spacing
                .trim();
            
            snippetText = decodeHtmlEntities(snippetText);
            
            // Filter out obvious ads or junk
            if (
                snippetText.length > 15 && 
                !snippetText.includes("Compare Prices") && 
                !snippetText.includes("Tickets On Sale") &&
                !snippets.includes(snippetText)
            ) {
                snippets.push(snippetText);
            }
        }
        
        return snippets;
    } catch (error) {
        console.error("Web search failed:", error.message);
        return [];
    }
}
