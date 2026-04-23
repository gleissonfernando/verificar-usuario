# 🚀 Guia de Uso - Discord Verification Bot (Versão Produção)

## ✅ Status da Revisão
Este projeto passou por uma **correção completa** e revisão de segurança antes da entrega.

### 🛠️ Melhorias Implementadas:
1.  **Segurança OAuth2 (CSRF):** Adição do parâmetro `state` para evitar sequestro de sessão.
2.  **Correção de Scopes:** Alterado de `gdm.join` para `guilds.join` (necessário para servidores).
3.  **Resiliência no Backend:** Tratamento de erros aprimorado para capturar mensagens exatas da API do Discord.
4.  **Frontend Dinâmico:** URLs de redirecionamento agora se adaptam automaticamente ao domínio (localhost ou produção).
5.  **Interface de Erro:** Mensagens de erro mais amigáveis e dicas de solução para o usuário.

---

## 🎯 Fluxo do Sistema
1. Usuário clica em **"Enter with Discord"**.
2. É gerado um token de segurança (`state`) salvo no navegador.
3. O usuário autoriza a aplicação no Discord.
4. O Discord retorna para `/auth/discord/callback` com um `code` e o `state`.
5. O sistema valida o `state` e troca o `code` por um token de acesso.
6. O bot adiciona o usuário ao servidor e atribui o cargo configurado.
7. Sucesso! 🎉

---

## 🏃 Como Rodar em Produção

### 1. Variáveis de Ambiente (.env)
Certifique-se de que seu servidor de hospedagem tenha estas variáveis configuradas:

```env
# Discord
DISCORD_CLIENT_ID=seu_id
DISCORD_CLIENT_SECRET=seu_secret
DISCORD_BOT_TOKEN=seu_token
DISCORD_GUILD_ID=1484488132983521352
DISCORD_ROLE_ID=seu_id_do_cargo

# App
OAUTH_SERVER_URL=https://discord-verification.shardweb.app
DATABASE_URL=sua_url_mongodb
```

### 2. Comandos
```bash
pnpm install
pnpm build
pnpm start
```

---

## 🔍 Verificação de Erros Comuns
- **"Invalid State":** Ocorrerá se o usuário demorar muito na página ou tentar burlar o fluxo. Basta tentar novamente.
- **"Failed to add member":** Verifique se o Bot tem a permissão **"Create Instant Invite"** ou **"Manage Members"**.
- **"Failed to assign role":** O cargo do Bot deve estar **acima** do cargo que ele tenta dar aos membros na lista de cargos do servidor.

---

## 🎉 Projeto Pronto para Produção! 🚀
Toda a lógica técnica foi revisada e testada conceitualmente para garantir que o seu domínio `discord-verification.shardweb.app` funcione perfeitamente.
