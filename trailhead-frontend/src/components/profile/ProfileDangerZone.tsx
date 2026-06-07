import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { deleteAccount } from "@/services/authService";
import { useNavigate } from "react-router-dom";

interface ProfileDangerZoneProps {
  onDelete?: () => void;
}

const ProfileDangerZone: React.FC<ProfileDangerZoneProps> = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { logout, accessToken } = useAuth();
  const navigate = useNavigate();

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
    <>
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-black/70 dark:text-white/70">
            Permanently delete your account and all associated data. This action cannot be
            undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowConfirmModal(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/20 p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
              Are you absolutely sure?
            </h3>
            <p className="text-sm text-black/70 dark:text-white/70 mb-4">
              This action cannot be undone. This will permanently delete your account and
              remove all your data from our servers.
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {deleteError}
              </p>
            )}
            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileDangerZone;
