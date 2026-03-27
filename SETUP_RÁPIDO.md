# NiceDrop - Setup Rápido 

## 🚀 Comece em 30 segundos

### Teste Local (SEM Supabase)

1. Abra `auth.html` no browser
2. E **ntrar** → Email: `demo@nicedrop.com` Password: `123456`
3. ✅ Painel abre!

Pronto! O site funciona.

---

## 📋 O Que Foi Feito

✅ **Site 100% Português** - Todas mensagens traduzidas  
✅ **Segurança Funcionando** - role='owner' acesso sim, role='client' acesso não  
✅ **CRUD de Clientes** - Tabela com Add/Edit/Delete  
✅ **Modo Demo** - Funciona sem Supabase para testes  
✅ **Pronto para Supabase** - 3 arquivos esperando credenciais  
✅ **Sem Erros** - Console limpo, código limpo

---

## ⚡ 3 Opções de Usar

### 1️⃣ Modo Demo (Grátis, Local)
- Funciona agora, sem servers
- Tudo em localStorage
- Ideal para testes

### 2️⃣ Modo Supabase (Production Ready)
- Credenciais + 5 minutos
- BD real, autenticação real
- Pronto para usar

### 3️⃣ Integrar com Seu Backend
- Modificar auth-supabase.js
- Trocar chamadas Supabase pelas suas

---

## 💻 Para Ligar Supabase

### 1. Copiar Credenciais
Vá a supabase.com → New Project → Settings → API

Copie:
```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGc...
```

### 2. Colar em supabase-config.js
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';
```

### 3. Executar SQL
Supabase → SQL Editor → Copiar `SUPABASE_SETUP.sql` → Run

### 4. Pronto!
- Abra auth.html
- Registar novamente
- Supabase criará automaticamente
- Admin: vai a Supabase → users → role: 'client' → 'owner'
- Cliente: logout da e login de novo
- Dashboard desbloqueado! ✅

---

## 📁 Arquivos Principais

```
nicedropcompany.github.io-main/
├── auth.html ..................... Login/Signup Interface
├── dashboard.html ................ Painel Principal
├── clients.html .................. Gestão de Clientes
├── index.html .................... Landing Page
│
├── auth-supabase.js .............. Lógica de Auth (MAIN)
├── dashboard.js .................. Lógica Dashboard
├── clients.js .................... Lógica Clientes
│
├── supabase-config.js ............ Config (⚠️ FALTA SUA CHAVE)
├── SUPABASE_SETUP.sql ............ Schema DB (⚠️ EXECUTAR EM SUPABASE)
│
├── TESTING_CHECKLIST.md .......... Guia de Testes Completo
├── SETUP_RÁPIDO.md ............... Este ficheiro
└── README.md ..................... (original)
```

---

## 🔐 Segurança

**Role = 'owner'** ✅ Pode acessar painel  
**Role = '** cliente'** ❌ Acesso bloqueado  
**Role = 'operator'** ❌ Acesso bloqueado  

Admin controla tudo via Supabase → users tabela.

---

## 🧪 Testes Rápidos

```javascript
// F12 → Console

// 1. Ver quem está logado
JSON.parse(localStorage.getItem('nicedrop_user'))

// 2. Promover para owner (modo demo)
let db = JSON.parse(localStorage.getItem('nicedrop_demo_db'));
let user = db.users.find(u => u.email === 'novo@test.com');
user.role = 'owner';
localStorage.setItem('nicedrop_demo_db', JSON.stringify(db));
// Agora login funciona!

// 3. Logout manual
localStorage.removeItem('nicedrop_user');
location.reload();
```

---

## ❓ FAQ

**P: Posso testar agora sem Supabase?**  
R: Sim! Email: `demo@nicedrop.com` Password: `123456`

**P: Como vira production?**  
R: Fill credenciais em supabase-config.js e execute SQL.

**P: Posso usar outro BD?**  
R: Sim, modifique auth-supabase.js para chamar seu backend.

**P: O site é responsivo?**  
R: Sim, tudo flexível para mobile também.

**P: Como remover um utilizador?**  
R: Supabase Dashboard → users tabela → delete row

**P: Preciso de email verification?**  
R: Supabase oferece automaticamente na configuração.

---

## 🎯 Próximos Passos

1. **Agora**: Teste o demo
2. **Depois**: Crie Supabase e preencha credenciais
3. **Finale**: Execute SQL e use produção

Qualquer dúvida, veja `TESTING_CHECKLIST.md`

---

**Status: ✅ PRONTO**  
Ficheiros seguros, testados e em português!
