import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { exchangeCodeForToken, getUserInfo, addUserToGuild, assignRoleToUser, generateAuthorizationUrl, getUserAvatarUrl, getUserDisplayName } from "./discord.service";
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
    getAuthUrl: publicProcedure
      .input(z.object({ redirectUri: z.string().url() }))
      .query(({ input }) => {
        const authUrl = generateAuthorizationUrl(input.redirectUri);
        return { authUrl };
      }),

    verify: publicProcedure
      .input(z.object({ code: z.string(), redirectUri: z.string().url() }))
      .mutation(async ({ input }) => {
        console.log("[Verification] Starting process for code:", input.code.substring(0, 5) + "...");
        
        let accessToken: string;
        let discordUser: any;

        // 1. Exchange Code for Token
        try {
          const tokenResponse = await exchangeCodeForToken(input.code, input.redirectUri);
          accessToken = tokenResponse.access_token;
          console.log("[Verification] Token exchange successful");
        } catch (error) {
          console.error("[Verification] Token exchange failed:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Erro ao trocar código: ${error instanceof Error ? error.message : "Desconhecido"}. Verifique se o Client Secret e Redirect URI estão corretos no seu painel.`,
          });
        }

        // 2. Get User Info
        try {
          discordUser = await getUserInfo(accessToken);
          console.log(`[Verification] Got user info: ${discordUser.username} (${discordUser.id})`);
        } catch (error) {
          console.error("[Verification] Get user info failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível obter seus dados do Discord.",
          });
        }

        // 3. Database Persistence (Non-blocking for the flow)
        try {
          await upsertDiscordUser({
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            email: discordUser.email,
            avatar: discordUser.avatar,
            status: "pending",
          });
        } catch (dbError) {
          console.error("[Verification] Database error (non-fatal):", dbError);
          // We continue even if DB fails to allow the user to get the role
        }

        // 4. Add to Guild & Assign Role
        let guildError = null;
        let roleError = null;

        try {
          await addUserToGuild(discordUser.id, accessToken);
          console.log("[Verification] User added to guild/already in guild");
        } catch (error) {
          console.error("[Verification] Add to guild failed:", error);
          guildError = error instanceof Error ? error.message : "Erro ao entrar no servidor";
        }

        try {
          await assignRoleToUser(discordUser.id);
          console.log("[Verification] Role assigned successfully");
        } catch (error) {
          console.error("[Verification] Assign role failed:", error);
          roleError = error instanceof Error ? error.message : "Erro ao dar cargo";
        }

        // 5. Final Status Update
        const finalStatus = (guildError || roleError) ? "failed" : "verified";
        const finalError = roleError || guildError;

        try {
          await upsertDiscordUser({
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            email: discordUser.email,
            avatar: discordUser.avatar,
            status: finalStatus,
            errorMessage: finalError,
            verifiedAt: finalStatus === "verified" ? new Date() : null,
          });
        } catch (e) {
          console.error("[Verification] Final DB update failed:", e);
        }

        if (finalStatus === "failed") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: finalError || "Falha na verificação final.",
          });
        }

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
      }),

    getStatus: publicProcedure
      .input(z.object({ discordId: z.string() }))
      .query(async ({ input }) => {
        const user = await getDiscordUserByDiscordId(input.discordId);
        return user || null;
      }),

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
