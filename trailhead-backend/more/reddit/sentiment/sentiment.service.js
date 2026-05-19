import axios from "axios";
import fs from "fs";
import { parse } from "json2csv";

export const generateRedditDataset = async () => {
    try {
        console.log("Sentiment dataset script started running...");

        const destinations = [
            "Florence", "Milan", "Nice", "Monaco",
            "Edinburgh", "Glasgow", "Zurich", "Interlaken",
            "Munich", "Frankfurt", "Dubrovnik", "Split",
            "Krakow", "Istanbul", "Antalya", "Marrakech",
            "Hanoi", "Phuket", "Chiang Mai"
        ];

        const results = [];

        const questionKeywords = [
            "any tips", "recommendations", "where should", "can anyone",
            "what are", "how do", "is it", "should i", "would you",
            "advice", "suggestions", "need help", "how much", "how long"
        ];

        console.log("Starting Reddit dataset generation");

        for (const destination of destinations) {
            const query = `${destination} travel OR itinerary OR vacation OR advice OR trip OR recommendations`;
            const redditUrl = "https://www.reddit.com/search.json";

            console.log(`Fetching posts for ${destination}`);

            const response = await axios.get(redditUrl, {
                params: { q: query, limit: 45, sort: "relevance" },
                headers: { "User-Agent": "TrailHead/1.0" },
            });

            const posts = response.data.data.children.map((child) => child.data);

            for (const p of posts) {
                const title = cleanText(p.title || "");
                const permalink = p.permalink;

                const isAsking = questionKeywords.some((kw) =>
                    title.toLowerCase().includes(kw)
                );
                if (!isAsking) continue;

                await sleep(1500);
                const topComment = await getTopComment(permalink);
                if (!topComment) continue;

                results.push({
                    title,
                    snippet: cleanText(topComment),
                    sentiment: "",
                });
            }

            await sleep(3000);
        }

        if (!results.length) {
            console.warn("No Reddit data collected.");
            return;
        }

        const csv = parse(results, { fields: ["title", "snippet", "sentiment"] });

        const filePath = "src/agents/reddit/sentiment/dataset/reddit_sentiment_dataset.csv";
        fs.mkdirSync("src/agents/reddit/sentiment/dataset", { recursive: true });
        if (fs.existsSync(filePath)) {
            fs.appendFileSync(filePath, "\n" + csv);
            console.log(`Appended ${results.length} new rows to existing dataset.`);
        } else {
            fs.writeFileSync(filePath, csv);
            console.log(`Created new dataset: ${filePath}`);
        }
        console.log(`Dataset saved successfully: ${filePath}`);
    } catch (error) {
        console.error("Error generating Reddit dataset:", error.message);
    }
};

async function getTopComment(permalink) {
    try {
        const url = `https://www.reddit.com${permalink}.json`;
        const res = await axios.get(url, {
            headers: { "User-Agent": "TrailHead/1.0" },
        });

        const comments = res.data[1]?.data?.children || [];
        const top = comments
            .filter((c) => c.kind === "t1" && c.data.body)
            .sort((a, b) => b.data.ups - a.data.ups)[0];
        return top ? top.data.body : null;
    } catch (error) {
        console.error("Error fetching comment:", error.message);
        return null;
    }
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function cleanText(text) {
    return text
        .replace(/https?:\/\/\S+/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/[*_~`>]/g, "")
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

generateRedditDataset();
