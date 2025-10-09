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
    <div
      className="reddit-insights max-w-md w-full mx-auto 
      bg-gradient-to-br from-white/10 via-white/5 to-transparent 
      backdrop-blur-2xl 
      border border-white/20 
      rounded-2xl 
      overflow-hidden mt-6 mb-10 transition-all duration-300"
    >
      {/* title of component */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-white font-family-ubuntu">
          Community Insights
        </h2>
      </div>

      {/* list of post */}
      <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
        {posts.map((post, index) => (
          <div
            key={index}
            className="flex items-start p-4 hover:bg-white/10 transition-all duration-200 group"
          >
            {/* number of upvotesn */}
            <div className="flex flex-col items-center w-10 text-gray-500 flex-shrink-0">
              <FaArrowUp className="text-orange-500 mb-1" />
              <span className="text-sm font-medium text-gray-400">
                {post.upvotes}
              </span>
            </div>

            {/* post */}
            <div className="flex-1 pl-3">
              <div className="text-xs text-gray-500 mb-1 font-bold">
                r/{post.subreddit}
              </div>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-300 hover:underline line-clamp-1 font-family-ubuntu"
              >
                {post.title}
              </a>
              <p className="text-sm text-white mt-1 line-clamp-3 font-family-opensans">
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





