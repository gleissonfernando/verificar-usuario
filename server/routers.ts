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
        console.log("[Verification] FORÇANDO ATRIBUIÇÃO DE CARGO");
        
        let accessToken: string;
        let discordUser: any;

        // 1. Troca de Código
        try {
          const tokenResponse = await exchangeCodeForToken(input.code, input.redirectUri);
          accessToken = tokenResponse.access_token;
        } catch (error) {
          console.error("[Verification] Erro no Token:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Erro de Autenticação: ${error instanceof Error ? error.message : "Falha ao validar com o Discord"}.`,
          });
        }

        // 2. Dados do Usuário
        try {
          discordUser = await getUserInfo(accessToken);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao obter perfil do Discord.",
          });
        }

        // 3. AÇÕES NO DISCORD (O CARGO É A PRIORIDADE)
        let roleSuccess = false;
        let errorMessage = "";

        // Tenta adicionar ao servidor primeiro (necessário para dar o cargo)
        try {
          await addUserToGuild(discordUser.id, accessToken);
        } catch (e) {
          console.warn("[Verification] Aviso ao entrar no servidor:", e);
          // Continua mesmo se já estiver no servidor
        }

        // TENTA DAR O CARGO AGORA
        try {
          await assignRoleToUser(discordUser.id);
          roleSuccess = true;
          console.log(`[Verification] CARGO ENTREGUE COM SUCESSO PARA: ${discordUser.username}`);
        } catch (error) {
          console.error("[Verification] FALHA AO DAR CARGO:", error);
          errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao atribuir cargo";
        }

        // 4. Salva o resultado no Banco (Sem travar o usuário)
        try {
          await upsertDiscordUser({
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            email: discordUser.email,
            avatar: discordUser.avatar,
            status: roleSuccess ? "verified" : "failed",
            errorMessage: roleSuccess ? null : errorMessage,
            verifiedAt: roleSuccess ? new Date() : null,
          });
        } catch (e) {
          console.error("[DB Error]", e);
        }

        // 5. Resposta Final
        if (!roleSuccess) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Verificação concluída, mas o cargo falhou: ${errorMessage}`,
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
