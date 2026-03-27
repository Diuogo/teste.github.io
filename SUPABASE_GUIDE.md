# NiceDrop Supabase Integration Guide

## 📋 Configuração do Supabase

### 1. Criar Projeto Supabase

1. Aceda a [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Project name**: nicedrop
   - **Database password**: guarde este! 🔐
   - **Region**: preferência sua (Portugal = eu-west-1)
4. Clique "Create new project"

### 2. Obter Credenciais

Após criar o projeto:

1. Aceda a **Settings → API**
2. Copie:
   - `Project URL` - coloque em `SUPABASE_URL`
   - `anon public` - coloque em `SUPABASE_ANON_KEY`

**Ficheiro: `supabase-config.js`**
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3. Criar Tabelas no Banco de Dados

1. Vá para **SQL Editor**
2. Clique em "New Query"
3. Se o projeto Supabase já tem tabelas antigas (`profiles`, `stores`, `drones`, `orders`), corra primeiro `SUPABASE_MIGRATE_LEGACY_TO_NICEDROP.sql`
4. Depois cole todo o conteúdo de `SUPABASE_SETUP.sql`
5. Clique **Run**

Isto cria as tabelas:
- `users` - perfis de utilizadores com roles
- `stores` - lojas geridas por owners
- `drones` - frotas de drones
- `clients` - clientes
- `team_members` - membros da equipa

### 4. Configurar Autenticação

1. Vá para **Authentication → Providers**
2. Verifique se "Email" está ativado (devia estar por defeito)
3. Vá para **Email Templates**
4. Deixe as predefinições ou personalize

## 🔄 Fluxo de Utilizadores

### Para Clientes NOVOS (implementar no café ☕)

1. **Cliente pede para aderir:**
   ```
   "Oi, quero usar NiceDrop para a minha loja!"
   ```

2. **Você (admin):**
   - Cria a loja no Supabase
   - Anota o email do cliente
   - Cliente recebe link de signup: `seu-site.com/auth.html`

3. **Cliente faz Signup:**
   - Email: seu@email.com
   - Senha: qualquer uma
   - Role: "Store Owner"
   - ✅ Conta criada com role = "client" (default)

4. **Você muda na BD:**
   - Vá para **Supabase Dashboard → SQL Editor**
   - Execute:
   ```sql
   UPDATE users SET role = 'owner' WHERE email = 'seu@email.com';
   ```
   - ✅ Agora é owner!

5. **Cliente faz Login:**
   - Email: seu@email.com
   - Senha: mesma
   - ✅ Acesso ao Dashboard!

## 🎯 Tabela: Users (Roles)

| role | Descrição | Dashboard | Clientes |
|------|-----------|----------|---------|
| `owner` | Dono da loja | ✅ SIM | ✅ SIM |
| `developer` | Dev da empresa | ❌ NÃO | ❌ NÃO |
| `operator` | Operador da loja | ❌ NÃO | ❌ NÃO |
| `client` | Cliente/novo | ❌ NÃO | ❌ NÃO |

### Mudar Role no Supabase

```sql
-- Promover cliente para owner
UPDATE users SET role = 'owner' WHERE email = 'cliente@example.com';

-- Remover acesso (voltar a client)
UPDATE users SET role = 'client' WHERE email = 'owner@example.com';

-- Ver todos os users
SELECT id, email, name, role, created_at FROM users;

-- Ver todos os owners
SELECT * FROM users WHERE role = 'owner';
```

## 🛡️ Segurança

- ✅ Passwords guardadas com hash pelo Supabase
- ✅ Row Level Security (RLS) ativada
- ✅ Owners só veem as suas lojas
- ✅ Tokens de sessão geridos por Supabase

## 📱 Como Funciona no Código

### Auth.html

1. **Signup**: Cria user no Supabase + perfil na tabela `users`
2. **Login**: Valida com Supabase Auth + fetch role da BD
3. **Verificação**: Se role = "owner" → Dashboard
4. **Se não owner**: Denegar acesso + logout

Nota: o `auth.html` já está ligado ao `auth-supabase.js` (com fallback demo quando a configuração não existe).

### Dashboard.html

```javascript
// Verifica se user está logado E é owner
function checkAuth() {
    const user = localStorage.getItem('nicedrop_user');
    if (!user || user.role !== 'owner') {
        window.location.href = 'auth.html';
    }
}
```

## 🐛 Troubleshooting

### "Supabase não inicializa"
- Verifique `supabase-config.js` com credentials corretas
- Verifique se a library de Supabase carregou (F12 → Console)

### "Erro ao fazer login"
- BD `users` existe? Verifique em Supabase Dashboard
- Email foi inserido na tabela após signup?

### "Está locked da bd"
- Verifique Row Level Security policies
- Pode desativar temporariamente para testes

## 📞 Suporte Supabase

- Documentação: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

---

**Pronto para usar! 🚀**

Próximos passos:
1. ✅ Copiar credenciais para `supabase-config.js`
2. ✅ Correr SQL do `SUPABASE_SETUP.sql`
3. ✅ Testar Signup → Login → Dashboard
4. ✅ Mudar role de test user para "owner"
5. ✅ Verificar acesso ao dashboard
