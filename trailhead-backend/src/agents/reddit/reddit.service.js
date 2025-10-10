import axios from "axios";
import { spawn } from "child_process";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const REDDIT_PORT = process.env.REDDIT_PORT || 8000;
const REDDIT_BACKEND_URL = `http://localhost:${REDDIT_PORT}/api/analyze`;

// 🔧 use absolute path to your venv python
const pythonPath = path.resolve("./venv/Scripts/python.exe");

let redditProcessStarted = false;
let redditReady = false; // 🔧 to track readiness

function startRedditBackend() {
  if (redditProcessStarted) return;
  redditProcessStarted = true;

  console.log("Launching Reddit sentiment backend...");
  console.log("Using Python path:", pythonPath);

  const env = { ...process.env };

  // 🔧 spawn backend inside venv with cwd
  const redditProc = spawn(
    pythonPath,
    ["-m", "src.agents.reddit.core.app"],
    {
      stdio: "inherit",
      env: env,
      cwd: path.resolve("./"),
    }
  );

  // 🔧 wait a few seconds before sending first request
  setTimeout(() => {
    redditReady = true;
    console.log("✅ Reddit backend ready on http://localhost:8000");
  }, 4000); // wait 4s for FastAPI to boot

  redditProc.on("error", (err) => {
    console.error("Failed to start Reddit backend:", err);
  });

  redditProc.on("exit", (code) => {
    console.log(`Reddit backend stopped (code ${code})`);
    redditProcessStarted = false;
    redditReady = false;
  });
}

// Fetch Reddit travel tips and analyze using the Python backend
export const getRedditAdvice = async (destination) => {
  try {
    startRedditBackend();

    // 🔧 ensure backend is ready before making request
    while (!redditReady) {
      await new Promise((r) => setTimeout(r, 500));
    }

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

    const posts = await Promise.all(
      rawPosts.map(async (post) => {
        const topComment = await getTopComment(post.permalink);
        return {
          title: post.title,
          comment: topComment || "No useful comments available.",
          upvotes: post.ups,
          url: `https://reddit.com${post.permalink}`,
        };
      })
    );

    const analysisResponse = await axios.post(
      REDDIT_BACKEND_URL,
      { posts },
      { headers: { "Content-Type": "application/json" } }
    );

    const sortedPosts = analysisResponse.data.posts
      .sort((a, b) => b.upvotes - a.upvotes);

    return {
      destination,
      query,
      analyzedPosts: analysisResponse.data.posts.map((p) => ({
        title: p.title,
        comment: p.comment,
        upvotes: p.upvotes,
        url: p.url,
      })),
    };
  } catch (error) {
  if (error.response) {
    console.error("Reddit Service Error:", error.response.status, error.response.data);
  } else {
    console.error("Reddit Service Error:", error.message);
  }
  throw new Error("Failed to fetch Reddit data");
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

    return top ? top.data.body.slice(0, 300) : null;
  } catch (error) {
    console.warn("Error fetching top comment:", error.message);
    return null;
  }
}
