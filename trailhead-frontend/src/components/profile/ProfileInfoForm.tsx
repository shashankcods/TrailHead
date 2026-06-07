import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileInfoFormProps {
  initialName: string;
  email: string;
  initialBio: string;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  initialName,
  email,
  initialBio,
}) => {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Avatar Section */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
            <span className="text-4xl font-bold text-black/40 dark:text-white/40">
              {initialName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <Button variant="outline" disabled>
            Change Picture (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-black/20 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">
              Bio
              <span className="text-xs text-black/40 dark:text-white/40 ml-1">
                ({bio.length}/500)
              </span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-black/20 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {saveSuccess && (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                Saved successfully!
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInfoForm;
