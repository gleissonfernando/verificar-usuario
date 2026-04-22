# Guia de Configuração - Discord Verification Bot

## 📋 Resumo do Sistema

O sistema de verificação Discord **já está completamente implementado**. Quando um usuário clica no botão "Enter with Discord", o seguinte fluxo ocorre automaticamente:

1. ✅ Redirecionamento para autorização Discord
2. ✅ Troca do código por token de acesso
3. ✅ Obtenção dos dados do usuário
4. ✅ Adição do usuário ao servidor Discord
5. ✅ **Atribuição automática do cargo**
6. ✅ Marcação como verificado no banco de dados

## 🔧 Configuração Necessária

### Passo 1: Criar um Aplicativo Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Dê um nome ao seu aplicativo (ex: "Discord Verification Bot")
4. Vá para a aba "OAuth2" → "General"
5. Copie o **Client ID** (você precisará disso)
6. Clique em "Reset Secret" e copie o **Client Secret**

### Passo 2: Criar um Bot

1. Na aba esquerda, clique em "Bot"
2. Clique em "Add Bot"
3. Sob "TOKEN", clique em "Reset Token"
4. Copie o **Bot Token** (guarde com segurança!)

### Passo 3: Configurar Permissões do Bot

1. Na aba "Bot", role para baixo até "Scopes"
2. Marque as seguintes permissões:
   - `identify`
   - `email`
   - `guilds.join`

3. Role para baixo até "Permissions" e marque:
   - `Manage Roles`
   - `Manage Members`

### Passo 4: Configurar OAuth2 Redirect

1. Vá para "OAuth2" → "General"
2. Clique em "Add Redirect"
3. Adicione: `http://localhost:5173/auth/discord/callback` (para desenvolvimento)
4. Adicione: `https://seu-dominio.com/auth/discord/callback` (para produção)

### Passo 5: Obter IDs do Servidor e Cargo

#### Obter Guild ID:
1. Abra seu servidor Discord
2. Clique com botão direito no nome do servidor
3. Clique em "Copy Server ID"
4. Salve como **DISCORD_GUILD_ID**

#### Obter Role ID:
1. Vá para "Configurações do Servidor" → "Funções"
2. Crie uma nova função (ex: "Verificado") ou use uma existente
3. Clique com botão direito na função
4. Clique em "Copy Role ID"
5. Salve como **DISCORD_ROLE_ID**

### Passo 6: Adicionar Bot ao Servidor

1. No Developer Portal, vá para "OAuth2" → "URL Generator"
2. Marque os scopes: `bot`
3. Marque as permissões: `Manage Roles`, `Manage Members`
4. Copie a URL gerada
5. Abra em seu navegador e selecione o servidor para adicionar o bot

## 📝 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Environment Variables for Discord Verification Project

# App Configuration
VITE_APP_ID=seu_app_id_aqui
JWT_SECRET=sua_chave_secreta_jwt_aqui
OAUTH_SERVER_URL=http://localhost:5173
OWNER_OPEN_ID=seu_owner_id_aqui

# Database
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/database_name

# Discord API
DISCORD_CLIENT_ID=seu_client_id_aqui
DISCORD_CLIENT_SECRET=seu_client_secret_aqui
DISCORD_BOT_TOKEN=seu_bot_token_aqui
DISCORD_GUILD_ID=seu_guild_id_aqui
DISCORD_ROLE_ID=seu_role_id_aqui

# External APIs (opcional)
BUILT_IN_FORGE_API_URL=sua_forge_api_url
BUILT_IN_FORGE_API_KEY=sua_forge_api_key
```

## 🚀 Executar o Projeto

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev
```

Acesse: `http://localhost:5173`

### Produção

```bash
# Build
pnpm build

# Iniciar servidor
pnpm start
```

## 🔍 Fluxo Técnico Detalhado

### 1. Página de Verificação (`client/src/pages/Verification.tsx`)
- Usuário clica em "Enter with Discord"
- Chama `discord.getAuthUrl` para obter URL de autorização
- Redireciona para Discord OAuth

### 2. Callback Discord (`client/src/pages/DiscordCallback.tsx`)
- Discord redireciona com código de autorização
- Chama `discord.verify` com o código

### 3. Backend - Verificação (`server/routers.ts` - `discord.verify`)
```typescript
// 1. Troca código por token
const tokenResponse = await exchangeCodeForToken(code, redirectUri);

// 2. Obtém dados do usuário
const discordUser = await getUserInfo(accessToken);

// 3. Salva no banco de dados
await upsertDiscordUser({ ...discordUser, status: "pending" });

// 4. Adiciona ao servidor
await addUserToGuild(discordUser.id, accessToken);

// 5. ATRIBUI O CARGO AUTOMATICAMENTE ⭐
await assignRoleToUser(discordUser.id);

// 6. Marca como verificado
await upsertDiscordUser({ ...discordUser, status: "verified" });
```

### 4. Serviço Discord (`server/discord.service.ts`)

#### `assignRoleToUser(userId: string)`
```typescript
// Faz uma requisição PUT para a API do Discord
// Endpoint: /guilds/{guildId}/members/{userId}/roles/{roleId}
// Headers: Authorization: Bot {botToken}
```

## ✅ Checklist de Verificação

- [ ] Aplicativo Discord criado
- [ ] Bot criado e token obtido
- [ ] Permissões do bot configuradas
- [ ] Redirect URI adicionado
- [ ] Bot adicionado ao servidor
- [ ] Guild ID obtido
- [ ] Role ID obtido
- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Projeto rodando em desenvolvimento (`pnpm dev`)
- [ ] Teste de verificação realizado

## 🐛 Troubleshooting

### Erro: "Discord Bot Token or Guild ID not configured"
- Verifique se as variáveis `DISCORD_BOT_TOKEN` e `DISCORD_GUILD_ID` estão no `.env`
- Reinicie o servidor

### Erro: "Failed to assign role"
- Verifique se o bot tem permissão "Manage Roles"
- Verifique se o cargo está abaixo do cargo do bot na hierarquia
- Verifique se o `DISCORD_ROLE_ID` está correto

### Erro: "Failed to add user to guild"
- Verifique se o bot tem permissão "Manage Members"
- Verifique se o usuário já não está no servidor

### Usuário não recebe o cargo
- Verifique se o `DISCORD_ROLE_ID` está correto
- Verifique os logs do servidor para mensagens de erro
- Verifique se o bot está online no servidor Discord

## 📚 Referências

- [Discord Developer Documentation](https://discord.com/developers/docs)
- [Discord OAuth2 Guide](https://discord.com/developers/docs/topics/oauth2)
- [Discord API - Assign Role](https://discord.com/developers/docs/resources/guild#add-guild-member-role)

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe seu `DISCORD_BOT_TOKEN` ou `DISCORD_CLIENT_SECRET`
- Mantenha o arquivo `.env` fora do controle de versão (já está no `.gitignore`)
- Em produção, use variáveis de ambiente seguras (não arquivo `.env`)
- Revogue tokens comprometidos imediatamente no Discord Developer Portal

---

**Pronto para começar?** Siga os passos acima e o sistema estará funcionando!
