import axios from "axios";

async function testDDGApi(query) {
    try {
        console.log(`Querying DDG API for: ${query}`);
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
        const res = await axios.get(url);
        console.log("Status:", res.status);
        console.log("Abstract:", res.data.Abstract);
        console.log("AbstractSource:", res.data.AbstractSource);
        console.log("RelatedTopics length:", res.data.RelatedTopics ? res.data.RelatedTopics.length : 0);
    } catch (e) {
        console.error("DDG API error:", e.message);
    }
}

testDDGApi("Nvidia");
