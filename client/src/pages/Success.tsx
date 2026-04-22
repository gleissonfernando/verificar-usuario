import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Loader2 } from "lucide-react";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string | null;
  displayName: string;
}

export default function SuccessPage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user info from sessionStorage
        const userJson = sessionStorage.getItem("discordUser");
        if (userJson) {
          try {
            setUser(JSON.parse(userJson));
          } catch (err) {
            console.error("Failed to parse user data:", err);
            setError("Invalid verification data");
          }
        } else {
          setError("No verification data found");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Failed to load verification data");
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-gray-900 flex items-center justify-center px-4">
        <div className="glass p-8 md:p-12 max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Verification Data Not Found</h1>
          <p className="text-gray-400">{error || "Please start the verification process again"}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const userTag = user.displayName || `${user.username}#${user.discriminator}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-gray-900 flex items-center justify-center px-4">
      {/* Animated background gradient */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass p-8 md:p-12 space-y-8">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Success message */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              ✅ Verification Complete
            </h1>
            <p className="text-gray-400 text-lg">
              Your Discord account has been successfully verified
            </p>
          </div>

          {/* User info card */}
          <div className="bg-black/50 border border-red-500/30 rounded-lg p-6 space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <img
                src={user.avatar}
                alt={userTag}
                className="w-24 h-24 rounded-full border-2 border-red-500 glow-red"
              />
            </div>

            {/* User details */}
            <div className="space-y-3 text-center">
              <div>
                <p className="text-gray-500 text-sm">Discord Username</p>
                <p className="text-white text-xl font-semibold">{userTag}</p>
              </div>

              {user.email && (
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="text-gray-300 text-sm break-all">{user.email}</p>
                </div>
              )}

              <div>
                <p className="text-gray-500 text-sm">Discord ID</p>
                <p className="text-gray-300 text-xs font-mono">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
              <p className="text-green-400 text-sm font-semibold">✓ Verified</p>
            </div>
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
              <p className="text-green-400 text-sm font-semibold">✓ Role Assigned</p>
            </div>
          </div>

          {/* Info text */}
          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>You have been added to our Discord server</p>
            <p>Your verification role has been automatically assigned</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 glow-red"
            >
              Return to Home
            </button>
            <button
              onClick={() => window.open("https://discord.com/app", "_blank")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 border border-gray-700"
            >
              Open Discord
            </button>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full opacity-50"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full opacity-75"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
