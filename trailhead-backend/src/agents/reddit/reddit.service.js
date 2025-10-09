import axios from "axios";
import { spawn } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const REDDIT_PORT = process.env.REDDIT_PORT || 8000;
const REDDIT_BACKEND_URL = `http://localhost:${REDDIT_PORT}/api/analyze`;

let redditProcessStarted = false;


//Starts the Reddit FastAPI backend automatically (if not already running)
function startRedditBackend() {
  if (redditProcessStarted) return;
  redditProcessStarted = true;

  console.log("🚀 Launching Reddit sentiment backend...");

  const process = spawn("python3", ["-m", "src.agents.reddit.core.app"], {
    stdio: "inherit",
   });


  process.on("error", (err) => {
    console.error("Failed to start Reddit backend:", err);
  });

  process.on("exit", (code) => {
    console.log(`🧠 Reddit backend stopped (code ${code})`);
    redditProcessStarted = false;
  });
}


//Fetch Reddit travel tips and analyze using the Python backend
export const getRedditAdvice = async (destination) => {
  try {
    // Start backend if not already running
    startRedditBackend();

    console.log(`Fetching Reddit advice for: ${destination}`);

    const query = `${destination} travel tips`;
    const redditUrl = "https://www.reddit.com/search.json";

    const response = await axios.get(redditUrl, {
      params: { q: query, limit: 10, sort: "relevance" },
      headers: { "User-Agent": "TrailHead/1.0" },
    });

    const rawPosts = response.data.data.children
      .map((child) => child.data)
      .filter((post) => !post.over_18);

    // Fetch top comment for each post
    const posts = await Promise.all(
      rawPosts.map(async (post) => {
        const topComment = await getTopComment(post.permalink);
        return {
          title: post.title,
          snippet: topComment || "No useful comments available.",
          url: `https://reddit.com${post.permalink}`,
        };
      })
    );

    // Send posts to the FastAPI backend
    const analysisResponse = await axios.post(
      REDDIT_BACKEND_URL,
      { posts },
      { headers: { "Content-Type": "application/json" } }
    );

    return {
      destination,
      query,
      analyzedPosts: analysisResponse.data.posts,
    };
  } catch (error) {
    console.error("Reddit Service Error:", error.message);
    throw new Error("Failed to fetch Reddit data");
  }
};

// Helper to get the top comment
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

    return top ? top.data.body.slice(0, 300) : null;
  } catch (error) {
    console.warn("Error fetching top comment:", error.message);
    return null;
  }
}
