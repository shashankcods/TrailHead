import React, { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

const BackendDownOverlay: React.FC = () => {
  const [isDown, setIsDown] = useState(false);

  const check = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(5000) });
      setIsDown(!res.ok);
    } catch {
      setIsDown(true);
    }
  };

  useEffect(() => {
    check();
  }, []);

  if (!isDown) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 rounded-2xl bg-white dark:bg-zinc-900 p-8 text-center shadow-2xl">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
          Service Unavailable
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          The TrailHead backend is currently offline. This may be due to scheduled
          maintenance, exceeded hosting credits, or a temporary outage.
          <br /><br />
          Please check back later or contact the team if the issue persists.
        </p>
        <button
          onClick={check}
          className="px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-80 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default BackendDownOverlay;
