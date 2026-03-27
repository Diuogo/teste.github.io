# NiceDrop - Documentacao Tecnica Completa

## 1. Resumo Executivo

O projeto NiceDrop e uma plataforma web composta por:
- Landing page institucional para apresentacao da marca e proposta de valor.
- Camada de autenticacao com dois modos de funcionamento (Supabase online e modo local/demo).
- Dashboard operacional para gestao de lojas, drones e membros de equipa (fluxo atual principal em localStorage).
- Paginas utilitarias de download, recuperacao de password e confirmacao de pagamento.

A base de codigo esta num estado hibrido, com transicao entre arquitetura local e arquitetura Supabase. Esta documentacao foi escrita para:
- Facilitar onboarding tecnico.
- Descrever o comportamento funcional atual.
- Definir o contrato de dados esperado para migracao segura para Supabase.
- Fornecer procedimentos operacionais e de troubleshooting.

---

## 2. Objetivos de Produto e Regras de Negocio

### 2.1 Objetivos funcionais
- Permitir apresentacao comercial do conceito NiceDrop.
- Permitir registo e autenticacao de contas.
- Restringir acesso ao dashboard por role.
- Permitir criacao de loja por utilizador developer.
- Permitir gestao de operadores por utilizador owner.

### 2.2 Regras de permissao
- `developer`: pode criar lojas e atribuir owner por email.
- `owner`: pode gerir membros (adicionar/remover/trocar role owner/operator) dentro do contexto da loja.
- `operator`: papel operacional de loja; sem acesso ao fluxo principal de administracao de contas.
- `client`: pode criar conta, mas nao pode entrar no dashboard.
- `admin`: papel previsto sobretudo para fluxo Supabase em `admin.html`/`admin.js`.

### 2.3 Restricoes criticas
- Uma conta `client` nao deve conseguir entrar no dashboard.
- O owner primario da loja nao deve ser removido por operacoes de UI sem substituicao.
- No modelo Supabase final, a loja deve manter pelo menos um owner em `team_members`.

---

## 3. Inventario de Ficheiros

### 3.1 Frontend principal
- `index.html`: landing page institucional.
- `style.css`: estilos globais da landing e paginas derivadas.
- `script.js`: reveal animations (IntersectionObserver).

### 3.2 Autenticacao e acesso
- `auth.html`: interface de login/registo; atualmente ligada a Supabase script com fallback demo.
- `auth.js`: fluxo localStorage puro (legado/alternativo).
- `auth-supabase.js`: autenticacao hibrida (online Supabase + offline demo).
- `supabase-config.js`: configuracao de credenciais e inicializacao do client Supabase.

### 3.3 Operacoes de dashboard
- `dashboard.html`: layout 3 colunas (lojas, metricas/drones, membros).
- `dashboard.css`: sistema visual do dashboard.
- `dashboard.js`: logica operacional atual do dashboard (localStorage).

### 3.4 Gestao de utilizadores/clientes (fluxos legados/alternativos)
- `admin.html`, `admin.css`, `admin.js`: painel admin para Supabase (`users`, `stores`).
- `clients.html`, `clients.css`, `clients.js`: gestao de clientes em modo local (mock data).

### 3.5 Paginas auxiliares
- `download.html`, `download.css`, `download.js`: pagina promocional de app mobile.
- `recovery.html`: redefinicao de password com token Supabase via hash URL.
- `pay_success.html`: pagina de sucesso de pagamento.

### 3.6 SQL e documentacao operacional
- `SUPABASE_SETUP.sql`: schema alvo principal + triggers + RLS.
- `SUPABASE_MIGRATE_LEGACY_TO_NICEDROP.sql`: migracao de compatibilidade de estruturas antigas para schema atual.
- `SUPABASE_GUIDE.md`: guia de integracao Supabase.
- `SETUP_RAPIDO.md`: setup curto (historico; contem referencias legadas).
- `DASHBOARD_SETUP.md`: guia antigo de dashboard (schema desatualizado face ao setup principal).

---

## 4. Arquitetura Logica

## 4.1 Vista em camadas
1. Camada de apresentacao (HTML/CSS): landing, auth, dashboard, paginas auxiliares.
2. Camada de comportamento (JavaScript): validacoes, controlo de sessao, renderizacao UI, logica de permissao.
3. Camada de persistencia:
- Modo local: localStorage (`user`, `users`, `nd_stores`, `nd_drones`, `nd_store_members`, etc.).
- Modo online: Supabase Auth + tabelas SQL (`users`, `stores`, `team_members`, `drones`, `clients`).

## 4.2 Estados de execucao
- Estado A: Sem credenciais Supabase -> auth entra em modo demo/local.
- Estado B: Com credenciais Supabase validas -> auth usa Supabase Auth e tabela `users`.
- Estado C: Dashboard atual continua localStorage-centric, mesmo com auth online disponivel.

## 4.3 Implicacao tecnica
Existe um desalinhamento transitivo: autenticacao pode estar online enquanto dashboard ainda opera local. Isto e esperado no estado atual de migracao e deve ser explicitamente gerido no roadmap.

---

## 5. Fluxos Funcionais Detalhados

## 5.1 Landing -> Auth -> Dashboard
1. Utilizador abre `index.html`.
2. Botao Dashboard verifica `localStorage.user`.
3. Sem sessao: redireciona para `auth.html`.
4. Com sessao valida e role permitida: entra em `dashboard.html`.

## 5.2 Registo
### Modo Supabase (`auth-supabase.js` online)
1. `signUp` no Supabase Auth.
2. Insert em tabela `users` com role default `client`.
3. Utilizador fica registado mas ainda sem privilegios de owner.

### Modo demo/local
1. Insercao em `nicedrop_demo_db.users`.
2. Role default `client`.
3. Utilizador precisa promocao para owner para acesso a dashboard.

## 5.3 Login
### Modo Supabase
1. `signInWithPassword`.
2. Leitura de perfil em `users` por `id`.
3. Persistencia de sessao local (`user`).
4. Redirecionamento por role:
- `admin` -> `admin.html`
- `owner` -> `dashboard.html`
- outras roles -> bloqueio + signOut.

### Modo demo/local
1. Match email/password em `nicedrop_demo_db`.
2. Apenas role `owner` entra no dashboard.

## 5.4 Fluxo developer no dashboard (estado atual)
1. Developer preenche nome de loja + email do dono.
2. Sistema procura conta em `users` (localStorage).
3. Promove role da conta para `owner`.
4. Cria loja em `nd_stores` com `ownerEmail`.
5. Cria drones default e owner em `nd_store_members`.

## 5.5 Fluxo owner no dashboard
1. Owner visualiza apenas lojas em que `ownerEmail == user.email`.
2. Pode adicionar operador por email (conta tem de existir).
3. Pode remover membros (exceto owner principal).
4. Pode alternar role owner/operator em membros nao primarios.

---

## 6. Modelo de Dados LocalStorage

## 6.1 Chaves principais
- `user`: sessao ativa.
- `users`: contas registadas (modo local).
- `nd_stores`: lojas.
- `nd_drones`: drones por loja.
- `nd_store_members`: membros por loja.
- `nicedrop_demo_db`: base demo de auth-supabase offline.
- `nicedrop_user`: chave legada (migracao automatica em varios ficheiros).

## 6.2 Estruturas esperadas
### Sessao
```json
{
  "id": "seed-dev-1",
  "name": "Dev NiceDrop",
  "email": "dev@nicedrop.pt",
  "role": "developer"
}
```

### Loja
```json
{
  "id": 1,
  "name": "Porto Central",
  "ownerEmail": "dev@nicedrop.pt"
}
```

### Membro de loja
```json
{
  "id": "m-owner-1",
  "name": "Dev NiceDrop",
  "email": "dev@nicedrop.pt",
  "role": "owner"
}
```

### Drone
```json
{
  "id": "ND-001",
  "name": "Falcon I",
  "status": "active",
  "trips": 156,
  "distance": 450,
  "revenue": 3250,
  "expense": 1460
}
```

---

## 7. Modelo de Dados Supabase (Alvo)

## 7.1 Tabelas nucleares
- `users`: perfil global, role global, dados de contacto.
- `stores`: entidade loja com `owner_id` primario.
- `team_members`: membership por loja com role local (`owner`, `operator`).
- `drones`: frota por loja com metricas.
- `clients`: carteira de clientes por loja.

## 7.2 Integridade
- `users.role` com check para roles permitidas.
- `team_members` com unique `(store_id, user_id)`.
- Trigger para garantir owner primario da loja em `team_members`.
- Trigger para impedir loja sem owner.

## 7.3 RLS
Policias definidas para:
- `users`: self read, admin read/update, pesquisa por owner em cenarios de equipa.
- `stores`: admin total, membros leem, owner atualiza.
- `team_members`: admin total, members leem, owner gere membros da propria loja.
- `drones` e `clients`: acesso por membership da loja.

## 7.4 Script de migracao
`SUPABASE_MIGRATE_LEGACY_TO_NICEDROP.sql` trata:
- Criacao de estruturas em falta.
- Alinhamento de colunas antigas.
- Mapeamento `profiles -> users`.
- Seed de team members a partir de owner/store e dados legados.
- Preparacao para aplicacao posterior de `SUPABASE_SETUP.sql`.

---

## 8. Contratos de Modulo (JavaScript)

## 8.1 `auth-supabase.js`
### Responsabilidades
- Inicializacao condicional Supabase.
- Validacoes de input.
- SignUp/SignIn.
- Persistencia de sessao local compativel.
- Role gate e redirecionamentos.

### Funcoes centrais
- `initAuth()`
- `handleLogin()`
- `handleSignup()`
- `checkRoleAndRedirect()`
- `setStoredSession()`
- `clearSession()`

## 8.2 `auth.js`
### Responsabilidades
- Fluxo local puro com contas seed.
- Bloqueio de cliente no dashboard.
- Persistencia em `users` e `user`.

### Nota
Atualmente `auth.html` esta ligado a `auth-supabase.js`.
`auth.js` permanece como alternativa local e referencia historica.

## 8.3 `dashboard.js`
### Responsabilidades
- Bootstrap de dados locais.
- Filtragem de lojas por role/email.
- Render de metricas e drones.
- Gestao de membros por owner.
- Ferramentas developer para criacao de loja.

### Dominios internos
- Estado global `state`.
- Storage keys (`STORAGE_KEYS`).
- Renderizadores (`renderStores`, `renderDrones`, `renderMembers`).
- Acoes (`addMember`, `removeMember`, `toggleMemberRole`, `createStoreAndAssignOwner`).

## 8.4 `admin.js`
### Responsabilidades
- Painel de gestao de utilizadores em Supabase.
- Promocao/democao de role.
- Criacao de loja associada a owner por email.

### Dependencias
- Exige `users` e `stores` no Supabase.
- Exige role `admin` na sessao.

## 8.5 `clients.js`
### Responsabilidades
- CRUD de clientes em memoria local.
- Filtro por loja selecionada.
- Modais de detalhe/edicao.

### Nota
E um fluxo mock. Nao esta integrado na tabela `clients` do Supabase no estado atual.

---

## 9. UX, UI e Design System

## 9.1 Landing (`style.css` + `script.js`)
- Hero split com paines informativos.
- Seccoes por narrativa: problema -> solucao -> tecnologia -> futuro.
- Animações reveal com `IntersectionObserver`.
- Estrutura visual high-contrast com imagem de ceu e identidade premium.

## 9.2 Dashboard (`dashboard.css`)
- Layout em tres colunas com prioridade em legibilidade operacional.
- Cartoes quadrados para metricas.
- Blocos de ferramentas condicionais por role.
- Navegacao mobile secundaria (`mobile-nav`).

## 9.3 Paginas auxiliares
- `download.html`: pagina promocional de app.
- `pay_success.html`: pagina de estado positivo pos-pagamento.
- `recovery.html`: fluxo funcional de reset via Supabase tokens na hash URL.

---

## 10. Seguranca

## 10.1 Superficie de risco atual
- Codigo cliente com logica de permissao local e facilmente inspecionavel.
- Sessao localStorage sem hardening server-side no modo local.
- `recovery.html` contem credenciais hardcoded (necessita refactor urgente para config central).

## 10.2 Recomendacoes prioritarias
1. Remover credenciais hardcoded de `recovery.html` e usar `supabase-config.js`.
2. Consolidar unica origem de verdade para autenticacao (evitar scripts paralelos ativos).
3. Concluir migracao do dashboard para queries Supabase com RLS.
4. Definir Content Security Policy (CSP) e evitar inline scripts onde possivel.
5. Validar server-side todas as mudancas de role/membership no modelo online.

## 10.3 Seguranca de dados
- Nunca guardar passwords em localStorage em producao.
- Reservar modo demo apenas para ambiente nao produtivo.
- Garantir revisao periodica de policies RLS.

---

## 11. Procedimentos de Instalacao e Arranque

## 11.1 Modo local rapido
1. Abrir `index.html` ou `auth.html` no browser.
2. Criar conta local ou usar fluxo demo (quando aplicavel no script ativo).
3. Validar navegacao e restricoes de role.

## 11.2 Modo Supabase (estado recomendado)
1. Preencher credenciais em `supabase-config.js`.
2. Se base ja existir com schema antigo: correr `SUPABASE_MIGRATE_LEGACY_TO_NICEDROP.sql`.
3. Correr `SUPABASE_SETUP.sql`.
4. Testar signup/login em `auth.html`.
5. Promover conta para owner/admin conforme necessidade.

## 11.3 Validacao pos-setup
- Registo cria linha em `users`.
- Role `client` nao acede dashboard.
- Role `owner` redireciona para dashboard.
- Role `admin` redireciona para admin.

---

## 12. Operacao e Runbook

## 12.1 Promover cliente para owner
```sql
UPDATE users
SET role = 'owner'
WHERE email = 'empresa@email.com';
```

## 12.2 Criar loja para owner
```sql
INSERT INTO stores (owner_id, name, city)
VALUES ('OWNER_UUID', 'Loja Porto', 'Porto');
```

## 12.3 Adicionar owner secundario
```sql
INSERT INTO team_members (store_id, user_id, role)
VALUES (1, 'SECOND_OWNER_UUID', 'owner');
```

## 12.4 Alterar owner <-> operator
```sql
UPDATE team_members
SET role = 'operator'
WHERE store_id = 1
  AND user_id = 'USER_UUID';
```

---

## 13. Testes

## 13.1 Testes funcionais minimos
1. Registo de conta nova.
2. Login com role `client` bloqueado.
3. Login com role `owner` permitido.
4. Developer cria loja e owner.
5. Owner adiciona/remover operador.
6. Logout limpa sessao.

## 13.2 Testes de regressao
- Persistencia de sessao apos refresh.
- Renderizacao de lista de lojas apos criacao.
- Renderizacao de metricas sem drones.
- Compatibilidade com chave legada `nicedrop_user`.

## 13.3 Testes de seguranca
- Tentativa de acesso dashboard sem sessao.
- Tentativa de acesso dashboard como `client`.
- Tentativa de owner alterar owner primario.
- Em Supabase: validar bloqueios por RLS em conta nao membro.

---

## 14. Observabilidade e Debug

## 14.1 Sinais de runtime
- Logs console em auth e dashboard.
- Mensagens de UI em formularios e paines.

## 14.2 Fontes comuns de erro
- Credenciais Supabase placeholder.
- Schema incompleto no SQL.
- Divergencia entre scripts antigos e novos.
- Dados legacy em tabelas antigas (`profiles`, colunas antigas em `drones`/`orders`).

## 14.3 Procedimento de diagnostico rapido
1. Confirmar script carregado em cada pagina.
2. Confirmar estado de `localStorage.user`.
3. Confirmar conectividade Supabase (`window.supabaseConfig.isConfigured()`).
4. Confirmar existencia de registo em `users` para `auth.uid()`.
5. Confirmar policies RLS aplicadas.

---

## 15. Divida Tecnica e Plano de Evolucao

## 15.1 Divida atual
- Sistema de auth e dashboard parcialmente desacoplados (online vs local).
- Documentacao antiga coexistente com contratos novos.
- Paginas com `lang` e copy ainda parcialmente em ingles.
- Chaves/session naming historico em transicao.

## 15.2 Plano recomendado por fases
### Fase 1 - Consolidacao
- Unificar fluxo auth unico.
- Remover scripts/ficheiros realmente obsoletos.
- Unificar idioma e copy em pt-PT.

### Fase 2 - Migracao de dados e dashboard
- Reescrever `dashboard.js` para Supabase (stores/team_members/drones).
- Integrar `clients.js` com tabela `clients`.
- Eliminar dependencias operacionais de localStorage (exceto cache leve).

### Fase 3 - Hardening e escala
- Reforcar politicas RLS e auditoria de alteracoes.
- Criar testes automatizados de regressao.
- Implementar pipeline CI para lint/checks.

---

## 16. Glossario

- Owner: dono funcional de loja com permissao de equipa.
- Operator: colaborador operacional de loja.
- Client: conta de cliente final sem permissao de dashboard.
- Developer: papel interno para provisioning de lojas.
- Admin: papel de administracao global (fluxo Supabase admin).
- RLS: Row Level Security, filtro de acesso por linha no PostgreSQL/Supabase.

---

## 17. Checklist de Prontidao de Producao

- [ ] Credenciais reais em `supabase-config.js`.
- [ ] Script de migracao corrido (se projeto legacy).
- [ ] `SUPABASE_SETUP.sql` aplicado sem erros.
- [ ] Roles testadas em auth e dashboard.
- [ ] `recovery.html` sem credenciais hardcoded.
- [ ] Fluxos antigos descontinuados ou claramente marcados.
- [ ] Politicas RLS verificadas com contas de teste reais.

---

## 18. Conclusao

O NiceDrop esta funcional e com uma base solida para evolucao, mas encontra-se numa etapa de transicao arquitetural. O caminho para estabilidade de producao passa por consolidar o runtime em Supabase end-to-end, mantendo as regras de negocio ja implementadas (cliente sem dashboard, owner por loja, developer para provisioning) e reduzindo o acoplamento a estado local.

Esta documentacao deve ser tratada como fonte de verdade tecnica durante essa consolidacao.
