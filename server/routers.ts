import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { exchangeCodeForToken, getUserInfo, addUserToGuild, assignRoleToUser, generateAuthorizationUrl, getUserDisplayName, getUserAvatarUrl } from "./discord.service";
import { TRPCError } from "@trpc/server";
import { upsertDiscordUser, getDiscordUserByDiscordId, getVerifiedDiscordUsers } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  discord: router({
    /**
     * Get Discord OAuth2 authorization URL.
     */
    getAuthUrl: publicProcedure
      .input(z.object({ redirectUri: z.string().url() }))
      .query(({ input }) => {
        const authUrl = generateAuthorizationUrl(input.redirectUri);
        return { authUrl };
      }),

    /**
     * Exchange authorization code for access token and verify user.
     */
    verify: publicProcedure
      .input(z.object({ code: z.string(), redirectUri: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          // Exchange code for access token
          const tokenResponse = await exchangeCodeForToken(input.code, input.redirectUri);
          const accessToken = tokenResponse.access_token;

          // Get user info
          const discordUser = await getUserInfo(accessToken);

          // Save to database
          await upsertDiscordUser({
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            email: discordUser.email,
            avatar: discordUser.avatar,
            status: "pending",
          });

          // Add user to guild
          try {
            await addUserToGuild(discordUser.id, accessToken);
          } catch (error) {
            console.error("Failed to add user to guild:", error);
            await upsertDiscordUser({
              discordId: discordUser.id,
              username: discordUser.username,
              discriminator: discordUser.discriminator,
              email: discordUser.email,
              avatar: discordUser.avatar,
              status: "failed",
              errorMessage: "Failed to add user to server",
            });
            throw error;
          }

          // Assign role
          try {
            await assignRoleToUser(discordUser.id);
          } catch (error) {
            console.error("Failed to assign role:", error);
            await upsertDiscordUser({
              discordId: discordUser.id,
              username: discordUser.username,
              discriminator: discordUser.discriminator,
              email: discordUser.email,
              avatar: discordUser.avatar,
              status: "failed",
              errorMessage: "Failed to assign role",
            });
            throw error;
          }

          // Mark as verified
          await upsertDiscordUser({
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            email: discordUser.email,
            avatar: discordUser.avatar,
            status: "verified",
            verifiedAt: new Date(),
          });

          return {
            success: true,
            user: {
              id: discordUser.id,
              username: discordUser.username,
              discriminator: discordUser.discriminator,
              avatar: getUserAvatarUrl(discordUser),
              email: discordUser.email,
              displayName: getUserDisplayName(discordUser),
            },
          };
        } catch (error) {
          console.error("Discord verification failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Verification failed. Please try again.",
          });
        }
      }),

    /**
     * Get user verification status by Discord ID.
     */
    getStatus: publicProcedure
      .input(z.object({ discordId: z.string() }))
      .query(async ({ input }) => {
        const user = await getDiscordUserByDiscordId(input.discordId);
        return user || null;
      }),

    /**
     * Get all verified users (admin only).
     */
    listVerified: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      return getVerifiedDiscordUsers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
