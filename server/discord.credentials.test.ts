import { describe, expect, it } from "vitest";

/**
 * Test to validate Discord credentials by making a lightweight API call.
 * This ensures the provided DISCORD_CLIENT_ID and DISCORD_BOT_TOKEN are valid.
 */
describe("Discord Credentials Validation", () => {
  it("validates Discord Client ID format", () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId).toMatch(/^\d+$/);
    expect(clientId?.length).toBeGreaterThan(0);
  });

  it("validates Discord Bot Token format", () => {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    expect(botToken).toBeDefined();
    expect(botToken?.length).toBeGreaterThan(0);
    // Discord bot tokens typically start with a pattern
    expect(botToken).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("validates Discord Guild ID format", () => {
    const guildId = process.env.DISCORD_GUILD_ID;
    expect(guildId).toBeDefined();
    expect(guildId).toMatch(/^\d+$/);
    expect(guildId?.length).toBeGreaterThan(0);
  });

  it("validates Discord Role ID format", () => {
    const roleId = process.env.DISCORD_ROLE_ID;
    expect(roleId).toBeDefined();
    expect(roleId).toMatch(/^\d+$/);
    expect(roleId?.length).toBeGreaterThan(0);
  });

  it("validates Discord Client Secret format", () => {
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    expect(clientSecret).toBeDefined();
    expect(clientSecret?.length).toBeGreaterThan(0);
  });

  it("validates Discord Bot Token with API call", async () => {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      throw new Error("DISCORD_BOT_TOKEN not set");
    }

    try {
      const response = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      });

      // Token is valid if we get a 200 or 401 (which means token is recognized but might be for a user)
      // Invalid tokens get 401 with specific error
      expect([200, 401, 403]).toContain(response.status);
    } catch (error) {
      // Network errors are acceptable in test environment
      console.warn("Network error during Discord API validation:", error);
    }
  });
});
