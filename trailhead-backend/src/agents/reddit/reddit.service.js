import axios from "axios";

// Fetches top Reddit travel discussions and advice related to a given destination.
// Example: If destination = "Tokyo", the query becomes "Tokyo travel tips".
// Returns a list of posts with titles, upvotes, comments, and URLs.
export const getRedditAdvice = async (destination) => {
    try {
        // Step 1: Build the search query
        const query = `${destination} travel tips`;
        const redditUrl = "https://www.reddit.com/search.json";

        // Step 2: Send a GET request to Reddit's public search API
        // Reddit limits unauthenticated requests, so we include a User-Agent header
        const response = await axios.get(redditUrl, {
            params: { q: query, limit: 10, sort: "relevance" },
            headers: { "User-Agent": "TrailHead/1.0" },
        });

        // Step 3: Extract and format relevant data from Reddit’s nested JSON structure
        const posts = response.data.data.children
            .map((child) => child.data)
            .filter((post) => !post.over_18) // Skip NSFW posts to keep results clean
            .map((post) => ({
                title: post.title,
                subreddit: post.subreddit_name_prefixed,
                upvotes: post.ups,
                comments: post.num_comments,
                url: `https://reddit.com${post.permalink}`,
                snippet: post.selftext?.slice(0,200) || "No description available.",
            }));

        // Step 4: Return neatly structured Reddit advice data
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