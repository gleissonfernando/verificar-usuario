import { ENV } from "./_core/env";

/**
 * Discord API service for OAuth2, server management, and role assignment.
 */

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  email: string | null;
  avatar: string | null;
  global_name?: string | null;
}

interface DiscordAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * Exchange Discord authorization code for access token.
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<DiscordAccessTokenResponse> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Discord Client ID or Secret not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    scope: "identify email guilds.join",
  });

  const response = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Discord] Token exchange failed:", error);
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  return response.json() as Promise<DiscordAccessTokenResponse>;
}

/**
 * Get Discord user info using access token.
 */
export async function getUserInfo(accessToken: string): Promise<DiscordUser> {
  const response = await fetch("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Discord] Get user info failed:", error);
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  return response.json() as Promise<DiscordUser>;
}

/**
 * Add user to Discord server (guild).
 */
export async function addUserToGuild(userId: string, accessToken: string): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    throw new Error("Discord Bot Token or Guild ID not configured");
  }

  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: accessToken,
    }),
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.text();
    console.error("[Discord] Add user to guild failed:", error);
    throw new Error(`Failed to add user to guild: ${response.statusText}`);
  }
}

/**
 * Assign role to user in Discord server.
 */
export async function assignRoleToUser(userId: string): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_ROLE_ID;

  if (!botToken || !guildId || !roleId) {
    throw new Error("Discord Bot Token, Guild ID, or Role ID not configured");
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204 && response.status !== 201) {
    const error = await response.text();
    console.error("[Discord] Assign role failed:", error);
    throw new Error(`Failed to assign role: ${response.statusText}`);
  }
}

/**
 * Get user's display name (global_name or username#discriminator).
 */
export function getUserDisplayName(user: DiscordUser): string {
  if (user.global_name) {
    return user.global_name;
  }
  return `${user.username}#${user.discriminator}`;
}

/**
 * Get user's avatar URL with fallback.
 */
export function getUserAvatarUrl(user: DiscordUser): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  }
  // Fallback to default avatar based on discriminator
  const defaultAvatarIndex = parseInt(user.discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
}

/**
 * Generate Discord OAuth2 authorization URL.
 */
export function generateAuthorizationUrl(redirectUri: string): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    throw new Error("Discord Client ID not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email guilds.join",
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}
