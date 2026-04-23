import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Loader2, MessageSquare, ExternalLink } from "lucide-react";

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
  const [countdown, setCountdown] = useState(5);

  const DISCORD_CALL_URL = "https://discord.com/channels/1484488132983521352/1484514793502146652";

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJson = sessionStorage.getItem("discordUser");
        if (userJson) {
          try {
            setUser(JSON.parse(userJson));
          } catch (err) {
            console.error("Failed to parse user data:", err);
            setError("Dados de verificação inválidos");
          }
        } else {
          setError("Nenhum dado de verificação encontrado");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Falha ao carregar dados de verificação");
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Countdown and Auto-redirect logic
  useEffect(() => {
    if (!isLoading && user && !error) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        window.location.href = DISCORD_CALL_URL;
      }
    }
  }, [isLoading, user, error, countdown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="glass p-8 md:p-12 max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Dados não encontrados</h1>
          <p className="text-gray-400">{error || "Por favor, inicie o processo de verificação novamente"}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const userTag = user.displayName || `${user.username}#${user.discriminator}`;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Simplified background decoration */}
      <div className="fixed inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-green-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-red-600/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass p-8 md:p-12 space-y-8 text-center">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Success message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Usuário verificado com sucesso!
            </h1>
            <p className="text-gray-400">
              Sua conta do Discord foi vinculada e o cargo foi atribuído.
            </p>
          </div>

          {/* User profile preview */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 text-left">
            <img
              src={user.avatar}
              alt={userTag}
              className="w-16 h-16 rounded-full border-2 border-green-500"
            />
            <div>
              <p className="text-white font-semibold">{userTag}</p>
              <p className="text-green-500 text-xs font-medium uppercase tracking-wider">Verificado</p>
            </div>
          </div>

          {/* Redirect info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Redirecionando para a call...</span>
            </div>
            <p className="text-gray-400 text-xs">
              Você será movido automaticamente em <span className="text-white font-bold">{countdown}</span> segundos.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => window.location.href = DISCORD_CALL_URL}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              Entrar na Call Agora
              <ExternalLink className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
