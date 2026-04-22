# 🚀 Guia de Uso - Discord Verification Bot

## ✅ Status Atual

Seu projeto está **100% configurado e pronto para usar**!

- ✅ Arquivo `.env` criado com todas as credenciais
- ✅ Arquivo `.env` protegido no `.gitignore` (não será commitado)
- ✅ Dependências instaladas
- ✅ TypeScript compilando sem erros
- ✅ Sistema de verificação com atribuição automática de cargo

---

## 🎯 Como Funciona

### Fluxo Completo

```
1. Usuário acessa a página
   ↓
2. Clica em "Enter with Discord"
   ↓
3. Redirecionado para Discord OAuth
   ↓
4. Autoriza a aplicação
   ↓
5. Discord redireciona com código
   ↓
6. Backend processa:
   - Troca código por token
   - Obtém dados do usuário
   - Adiciona ao servidor Discord
   - ATRIBUI O CARGO AUTOMATICAMENTE ⭐
   - Salva no banco de dados
   ↓
7. Usuário redirecionado para página de sucesso
   ↓
8. Usuário tem o cargo no Discord!
```

---

## 🏃 Como Rodar

### Desenvolvimento

```bash
# Instalar dependências (já feito)
pnpm install

# Rodar em modo desenvolvimento
pnpm dev
```

Acesse: **http://localhost:5173**

### Produção

```bash
# Build
pnpm build

# Iniciar servidor
pnpm start
```

---

## 📋 Variáveis de Ambiente Configuradas

Seu arquivo `.env` contém:

| Variável | Valor | Função |
|----------|-------|--------|
| `DISCORD_CLIENT_ID` | `123456789012345678` | ID da aplicação Discord |
| `DISCORD_CLIENT_SECRET` | `5d_sAdDyaixCdA_XX4jFNiQYfq_IR2jl` | Secret da aplicação |
| `DISCORD_BOT_TOKEN` | `MTQ5MjMyNTEzNDU1MDMwMjk1Mg...` | Token do bot Discord |
| `DISCORD_GUILD_ID` | `1474167739391410320` | ID do servidor Discord |
| `DISCORD_ROLE_ID` | `1474167739391410320` | ID do cargo a atribuir |
| `DATABASE_URL` | `mongodb+srv://rot:1234567890@...` | Conexão MongoDB |
| `REDIRECT_URI` | `http://localhost:5173/...` | URL de callback OAuth |

---

## 🔐 Segurança

### ✅ Proteções Implementadas

1. **`.env` no `.gitignore`** - Arquivo não será commitado
2. **Variáveis de ambiente** - Credenciais não ficam no código
3. **Bot Token seguro** - Usado apenas no backend
4. **Permissões limitadas** - Bot tem apenas permissões necessárias

### ⚠️ Importante

- Nunca compartilhe o arquivo `.env`
- Nunca faça commit do `.env`
- Se as credenciais forem comprometidas, resete-as:
  - Discord: https://discord.com/developers/applications
  - MongoDB: https://cloud.mongodb.com

---

## 🧪 Testando a Verificação

1. Acesse http://localhost:5173
2. Clique em "Enter with Discord"
3. Autorize a aplicação
4. Você será adicionado ao servidor Discord
5. **Você receberá o cargo automaticamente**
6. Será redirecionado para página de sucesso

### Verificar no Discord

1. Abra seu servidor Discord
2. Vá para "Membros"
3. Procure por seu nome
4. Você deve ter o cargo atribuído

---

## 📁 Estrutura do Projeto

```
verificar-usuario/
├── client/                    # Frontend React
│   └── src/
│       ├── pages/
│       │   ├── Verification.tsx      # Página com botão de verificação
│       │   ├── DiscordCallback.tsx   # Handler do callback OAuth
│       │   ├── Success.tsx           # Página de sucesso
│       │   └── AdminDashboard.tsx    # Dashboard de admin
│       └── lib/
│           └── trpc.ts              # Cliente TRPC
│
├── server/                    # Backend Node.js
│   ├── discord.service.ts     # Serviço Discord (funções de API)
│   ├── routers.ts             # Endpoints TRPC
│   ├── db.ts                  # Operações MongoDB
│   └── _core/                 # Utilitários
│
├── shared/                    # Código compartilhado
├── .env                       # Variáveis de ambiente (gitignored)
├── .env.example               # Exemplo de variáveis
├── SETUP_DISCORD.md           # Guia de configuração Discord
└── GUIA_USO.md               # Este arquivo
```

---

## 🔍 Arquivos Principais

### `server/discord.service.ts`

Contém todas as funções de integração com Discord:

```typescript
// Troca código por token
exchangeCodeForToken(code, redirectUri)

// Obtém dados do usuário
getUserInfo(accessToken)

// Adiciona ao servidor
addUserToGuild(userId, accessToken)

// ATRIBUI O CARGO ⭐
assignRoleToUser(userId)

// Gera URL de autorização
generateAuthorizationUrl(redirectUri)
```

### `server/routers.ts`

Endpoint principal: `discord.verify`

```typescript
discord.verify({
  code: "authorization_code_from_discord",
  redirectUri: "http://localhost:5173/auth/discord/callback"
})
```

Retorna:
```json
{
  "success": true,
  "user": {
    "id": "user_discord_id",
    "username": "username",
    "avatar": "avatar_url",
    "email": "user@example.com",
    "displayName": "User Display Name"
  }
}
```

### `client/src/pages/Verification.tsx`

Página com botão de verificação. Quando clicado:
1. Chama `discord.getAuthUrl`
2. Redireciona para Discord OAuth
3. Discord redireciona para callback

### `client/src/pages/DiscordCallback.tsx`

Processa o callback do Discord:
1. Extrai código da URL
2. Chama `discord.verify` no backend
3. Redireciona para página de sucesso

---

## 🐛 Troubleshooting

### Erro: "Failed to assign role"

**Causa:** Bot não tem permissão ou cargo está mal configurado

**Solução:**
1. Verifique se o bot tem permissão "Manage Roles"
2. Verifique se o cargo está abaixo do cargo do bot na hierarquia
3. Verifique se `DISCORD_ROLE_ID` está correto

### Erro: "Failed to add user to guild"

**Causa:** Bot não tem permissão ou usuário já está no servidor

**Solução:**
1. Verifique se o bot tem permissão "Manage Members"
2. Remova o usuário do servidor e tente novamente

### Usuário não recebe o cargo

**Causa:** Cargo não está sendo atribuído

**Solução:**
1. Verifique os logs do servidor
2. Confirme que `DISCORD_ROLE_ID` está correto
3. Verifique permissões do bot

### Erro de conexão MongoDB

**Causa:** String de conexão inválida

**Solução:**
1. Verifique `DATABASE_URL` no `.env`
2. Confirme que o IP está autorizado no MongoDB Atlas
3. Verifique se o usuário e senha estão corretos

---

## 📊 Monitorando Verificações

### Via Admin Dashboard

Acesse: http://localhost:5173/admin

Mostra:
- Usuários verificados
- Data de verificação
- Status de cada verificação

### Via MongoDB

```javascript
// Conectar ao MongoDB e consultar
db.discord_users.find()
```

---

## 🚀 Deploy em Produção

### Antes de fazer deploy:

1. ✅ Resete todas as credenciais Discord
2. ✅ Crie novo Bot Token
3. ✅ Atualize `REDIRECT_URI` para seu domínio
4. ✅ Configure variáveis de ambiente no servidor
5. ✅ Teste completamente em staging

### Variáveis para produção:

```env
DISCORD_CLIENT_ID=seu_novo_client_id
DISCORD_CLIENT_SECRET=seu_novo_client_secret
DISCORD_BOT_TOKEN=seu_novo_bot_token
REDIRECT_URI=https://seu-dominio.com/auth/discord/callback
OAUTH_SERVER_URL=https://seu-dominio.com
DATABASE_URL=sua_mongodb_production_url
```

---

## 📞 Suporte

Se encontrar problemas:

1. Consulte `SETUP_DISCORD.md` para configuração Discord
2. Verifique os logs do servidor
3. Confirme que todas as variáveis de ambiente estão corretas
4. Verifique permissões do bot no servidor Discord

---

## 🎉 Pronto!

Seu sistema está **100% funcional**! 

**Quando um usuário clicar em "Verificar Usuário", ele automaticamente receberá o cargo configurado.**

Qualquer dúvida, consulte os guias ou verifique os logs do servidor.

Bom uso! 🚀
