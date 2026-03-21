import React from "react";
import { FaArrowUp } from "react-icons/fa";

type RedditPost = {
  title: string;
  comment: string;
  upvotes: number;
  subreddit: string;
  url: string;
};

const RedditInsights: React.FC<{ posts: RedditPost[] }> = ({ posts }) => {
  return (
    <div className="w-full mt-4 mb-10 p-4">
      {/* Title */}
      <h3 className="text-black dark:text-white text-2xl font-bold mb-6 text-center">
        Community Insights
      </h3>

      {/* Posts list */}
      <div className="flex flex-col gap-4 px-2">
        {posts.slice(0, 4).map((post, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-black/10 via-black/5 to-transparent dark:from-white/10 dark:via-white/5
              backdrop-blur-2xl
              border border-black/20 dark:border-white/20
              rounded-xl p-5 text-black dark:text-white text-left
              hover:bg-black/10 dark:hover:bg-white/20
              transition-all duration-300
              w-100
              h-48
              mx-auto
              flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-black/70 dark:text-white/70 font-semibold">
                  {post.subreddit}
                </span>
                <div className="flex items-center text-black/70 dark:text-white/70 text-sm">
                  <FaArrowUp className="text-black dark:text-white mr-1" />
                  {post.upvotes}
                </div>
              </div>

              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-black dark:text-white hover:underline line-clamp-2"
              >
                {post.title}
              </a>

              <p className="text-sm text-black/80 dark:text-white/80 mt-2 line-clamp-3">
                {post.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RedditInsights;






