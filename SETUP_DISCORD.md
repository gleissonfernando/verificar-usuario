# Guia de Configuração - Discord Verification Bot

## 📋 Resumo do Sistema

O sistema de verificação Discord utiliza o protocolo **OAuth2** para autenticar usuários e automatizar a entrada em servidores e atribuição de cargos.

## 🔧 Configuração Necessária

### Passo 1: Criar um Aplicativo Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Dê um nome ao seu aplicativo
4. Vá para a aba "OAuth2" → "General"
5. Copie o **Client ID**
6. Clique em "Reset Secret" e copie o **Client Secret**

### Passo 2: Criar um Bot

1. Na aba esquerda, clique em "Bot"
2. Clique em "Add Bot"
3. Sob "TOKEN", clique em "Reset Token"
4. Copie o **Bot Token**

### Passo 3: Configurar Scopes e Permissões

1. No menu lateral, vá em **OAuth2** → **General**.
2. Certifique-se de que os seguintes **Scopes** são permitidos:
   - `identify`
   - `email`
   - `guilds.join` (Crucial para adicionar o usuário ao servidor)

3. Na aba **Bot**, role para baixo até **Permissions** e marque:
   - `Manage Roles`
   - `Manage Members`

### Passo 4: Configurar OAuth2 Redirect

1. Vá para "OAuth2" → "General"
2. Clique em "Add Redirect"
3. Adicione: `http://localhost:5173/auth/discord/callback` (para desenvolvimento)
4. Adicione: `https://discord-verification.shardweb.app/auth/discord/callback` (para produção)

⚠️ **IMPORTANTE:** A URL de redirecionamento deve terminar exatamente em `/auth/discord/callback`.

### Passo 5: Obter IDs do Servidor e Cargo

#### Obter Guild ID:
1. Clique com botão direito no nome do servidor no Discord -> "Copy Server ID".

#### Obter Role ID:
1. Vá para "Configurações do Servidor" → "Funções" -> Clique com botão direito na função -> "Copy Role ID".

---

## 🚀 Segurança OAuth2 Implementada

O sistema agora conta com proteção **CSRF (Cross-Site Request Forgery)** utilizando o parâmetro `state`:
- O frontend gera um token aleatório antes do redirecionamento.
- O Discord retorna esse token no callback.
- O sistema valida se o token retornado é o mesmo que foi gerado, impedindo ataques de sequestro de sessão.

---

## 📝 Variáveis de Ambiente (.env)

```env
DISCORD_CLIENT_ID=seu_client_id
DISCORD_CLIENT_SECRET=seu_client_secret
DISCORD_BOT_TOKEN=seu_bot_token
DISCORD_GUILD_ID=seu_guild_id
DISCORD_ROLE_ID=seu_role_id
OAUTH_SERVER_URL=https://discord-verification.shardweb.app
```
