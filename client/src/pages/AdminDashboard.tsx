import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const listVerifiedQuery = trpc.discord.listVerified.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    retry: 2,
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, user?.role]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const verifiedUsers = listVerifiedQuery.data || [];
  const isLoading = listVerifiedQuery.isLoading;
  const isError = listVerifiedQuery.isError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-gray-900">
      {/* Fixed background gradient */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-red-500/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm">Verified Users Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass p-6 space-y-2">
            <p className="text-gray-400 text-sm">Total Verified</p>
            <p className="text-3xl font-bold text-white">{verifiedUsers.length}</p>
          </div>
          <div className="glass p-6 space-y-2">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-3xl font-bold text-green-500">Active</p>
          </div>
          <div className="glass p-6 space-y-2">
            <p className="text-gray-400 text-sm">Last Updated</p>
            <p className="text-sm text-gray-300">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Users table */}
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-500/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Discord User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Discord ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Verified At
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-red-400">
                      Failed to load users. Please try again.
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto" />
                    </td>
                  </tr>
                ) : verifiedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No verified users yet
                    </td>
                  </tr>
                ) : (
                  verifiedUsers.map((user) => (
                    <tr
                      key={user.discordId}
                      className="border-b border-red-500/10 hover:bg-red-500/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar && (
                            <img
                              src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                              alt={user.username}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span className="text-white font-medium">
                            {user.username}#{user.discriminator}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm font-mono">
                        {user.discordId}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {user.verifiedAt
                          ? new Date(user.verifiedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">
                          ✓ {user.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Showing {verifiedUsers.length} verified users</p>
        </div>
      </div>
    </div>
  );
}
