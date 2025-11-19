"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      // Load existing bio from public metadata
      const existingBio = (user.publicMetadata?.bio as string) || "";
      setBio(existingBio);
    }
  }, [user, isLoaded]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/update-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicMetadata: {
            bio: bio.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bio");
      }

      // Update the user object to reflect changes
      await user.reload();

      setMessage({ type: "success", text: "Bio updated successfully!" });
    } catch (error) {
      console.error("Error saving bio:", error);
      setMessage({
        type: "error",
        text: "Failed to save bio. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-700 p-8">
        <h1 className="mb-8 text-3xl font-bold text-white">Profile Settings</h1>

        {/* User Info Section */}
        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName ||
                  user.emailAddresses[0]?.emailAddress ||
                  "No name"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white">
              {user.emailAddresses[0]?.emailAddress || "No email"}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={6}
            maxLength={500}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 transition-colors resize-none"
          />
          <div className="mt-2 text-xs text-slate-400 text-right">
            {bio.length}/500 characters
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 ${
              message.type === "success"
                ? "bg-green-900/30 border border-green-700 text-green-300"
                : "bg-red-900/30 border border-red-700 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-6 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Bio"}
        </button>
      </div>

      {/* Additional Custom Fields Section - Example for future expansion */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-700 p-8">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Additional Information
        </h2>
        <p className="text-slate-400 text-sm">
          You can add more custom fields here in the future, such as:
        </p>
        <ul className="mt-4 space-y-2 text-slate-400 text-sm list-disc list-inside">
          <li>Location</li>
          <li>Website/Portfolio</li>
          <li>Social media links</li>
          <li>Skills/Expertise</li>
          <li>Interests</li>
        </ul>
      </div>
    </div>
  );
}
