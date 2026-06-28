import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import GradientBackground from "@/components/GradientBackground";
import { deleteAccount } from "@/services/authService";

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) navigate("/");
  }, [isClient, isAuthenticated, isLoading, navigate]);

  if (!isClient || isLoading || !isAuthenticated) return null;

  const initials = (user?.username ?? user?.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!accessToken) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(accessToken);
      await logout();
      navigate("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <GradientBackground>
      <Navbar />
      <main className="max-w-lg mx-auto px-6 py-12">

        {/* Avatar + identity */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xl font-extrabold select-none shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-extrabold text-black dark:text-white truncate">
              {user?.username ?? "Traveller"}
            </p>
            <p className="text-sm text-black/50 dark:text-white/50 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 rounded-xl border border-black/15 dark:border-white/20 bg-white dark:bg-black px-4 py-3 text-sm font-semibold text-black dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.06] transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-black px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            Delete account
          </button>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-black rounded-2xl border border-black/10 dark:border-white/20 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-black dark:text-white mb-2">
              Delete account?
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60 mb-5">
              This permanently deletes your account and all saved trips. This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteError(null); }}
                disabled={isDeleting}
                className="rounded-xl border border-black/15 dark:border-white/20 px-4 py-2 text-sm font-semibold hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </GradientBackground>
  );
};

export default ProfilePage;
