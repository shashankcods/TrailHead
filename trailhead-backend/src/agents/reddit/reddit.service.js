import axios from "axios";

export const getRedditAdvice = async (destination) => {
    try {
        const query = `${destination} travel tips`;
        const redditUrl = "https://www.reddit.com/search.json";

        const response = await axios.get(redditUrl, {
            params: { q: query, limit: 10, sort: "relevance" },
            headers: { "User-Agent": "TrailHead/1.0" },
        });

        const posts = response.data.data.children
            .map((child) => child.data)
            .filter((post) => !post.over_18)
            .map((post) => ({
                title: post.title,
                subreddit: post.subreddit_name_prefixed,
                upvotes: post.ups,
                comments: post.num_comments,
                url: `https://reddit.com${post.permalink}`,
                snippet: post.selftext?.slice(0,200) || "No description available.",
            }));

        return {
            destination,
            query,
            postCount: posts.length,
            posts,
        };
    } catch (error) {
        console.error("Reddit Service Error:", error.message);
        throw new Error("Failed to fetch Reddit data");
    }
};