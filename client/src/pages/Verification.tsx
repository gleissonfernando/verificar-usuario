import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function VerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthUrl = trpc.discord.getAuthUrl.useQuery(
    {
      redirectUri: `${window.location.origin}/auth/discord/callback`,
    },
    {
      enabled: false,
    }
  );

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a random state for security
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("discord_oauth_state", state);

      const { data } = await getAuthUrl.refetch();
      if (data?.authUrl) {
        // Append state to the auth URL
        const authUrl = new URL(data.authUrl);
        authUrl.searchParams.set("state", state);
        window.location.href = authUrl.toString();
      }
    } catch (err) {
      setError("Failed to initiate Discord login. Please try again.");
      console.error("Auth URL error:", err);
      setIsLoading(false);
    }
  };

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
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center glow-red">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.445.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.042-.106c-.628-.237-1.227-.528-1.8-.868a.077.077 0 00-.009-.128c.121-.09.242-.184.359-.277a.074.074 0 00.063-.01c3.778 1.788 7.102 1.788 10.861 0a.074.074 0 00.064.01c.117.093.238.187.359.277a.077.077 0 00-.007.128c-.573.34-1.172.63-1.805.867a.077.077 0 00-.041.107c.352.699.764 1.364 1.225 1.994a.076.076 0 00.084.028 19.963 19.963 0 006.002-3.03.077.077 0 00.032-.054c.5-4.506.8-8.930.358-13.087a.061.061 0 00-.031-.027zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Discord Verification
            </h1>
            <p className="text-gray-400 text-lg">
              Verify your Discord account to gain access
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-6 text-lg rounded-lg transition-all duration-300 glow-red disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.445.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.042-.106c-.628-.237-1.227-.528-1.8-.868a.077.077 0 00-.009-.128c.121-.09.242-.184.359-.277a.074.074 0 00.063-.01c3.778 1.788 7.102 1.788 10.861 0a.074.074 0 00.064.01c.117.093.238.187.359.277a.077.077 0 00-.007.128c-.573.34-1.172.63-1.805.867a.077.077 0 00-.041.107c.352.699.764 1.364 1.225 1.994a.076.076 0 00.084.028 19.963 19.963 0 006.002-3.03.077.077 0 00.032-.054c.5-4.506.8-8.930.358-13.087a.061.061 0 00-.031-.027zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
                </svg>
                Enter with Discord
              </>
            )}
          </Button>

          {/* Info text */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              By clicking "Enter with Discord", you agree to our Terms of Service
            </p>
            <p>
              Your Discord data will be securely stored and used only for verification
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full opacity-50"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full opacity-75"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
