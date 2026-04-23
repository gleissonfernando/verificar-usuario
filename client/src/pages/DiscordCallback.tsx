import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DiscordCallbackPage() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const verifyMutation = trpc.discord.verify.useMutation();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const savedState = localStorage.getItem("discord_oauth_state");

        if (!code) {
          setError("No authorization code received from Discord");
          setIsProcessing(false);
          return;
        }

        if (!state || state !== savedState) {
          setError("Security validation failed: Invalid state parameter");
          setIsProcessing(false);
          return;
        }

        // Clear state after use
        localStorage.removeItem("discord_oauth_state");

        // Verify with backend
        const result = await verifyMutation.mutateAsync({
          code,
          redirectUri: `${window.location.origin}/auth/discord/callback`,
        });

        if (result.success) {
          // Store user info in sessionStorage for success page
          sessionStorage.setItem("discordUser", JSON.stringify(result.user));
          // Redirect to success page
          navigate("/success");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Verification failed. Please try again."
        );
        setIsProcessing(false);
      }
    };

    processCallback();
  }, []);

  if (isProcessing && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto" />
          <p className="text-white text-lg">Verifying your Discord account...</p>
          <p className="text-gray-400 text-sm">Please wait while we process your verification</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <h1 className="text-2xl font-bold text-white">Falha na Verificação</h1>
          <p className="text-gray-400">{error}</p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-left">
            <p className="text-yellow-500 text-xs font-semibold uppercase mb-1">Dica:</p>
            <p className="text-gray-300 text-sm">
              Certifique-se de que você autorizou todos os escopos e que o bot tem as permissões necessárias no servidor.
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/"}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-red-500/20"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return null;
}
