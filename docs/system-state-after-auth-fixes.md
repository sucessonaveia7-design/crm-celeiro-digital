# System State — After Auth Fixes

**Data:** 2026-05-20  
**Branch de referência:** fix/auth-hardening-stable

---

## 1. Fluxo de Login

```
1. Usuário acessa qualquer rota protegida (ou /)
2. App.tsx monta → useEffect registra onAuthStateChange
3. Supabase dispara INITIAL_SESSION imediatamente:
   a. session válida no localStorage → evento com sessão
   b. sem sessão → evento com null → clearAuth() → render <Login>
4. Com sessão:
   a. setAuth(token, user) — sem org_id ainda
   b. setLoading(false) → UI aparece
   c. setProfileResolving(true) → roteamento bloqueado
   d. await fetchProfile(token) → GET /api/auth/profile
   e. setAuth com organization_id + organization_name
   f. setProfileResolving(false) → roteamento liberado
5. Routing: user.organization_id presente → render <Layout> com rotas principais
```

**GET /api/auth/profile:**
- Valida JWT via `requireAuth` middleware
- Busca `profiles.active_organization_id` via supabaseAdmin (bypassa RLS)
- Busca `organizations.name` pelo org_id
- Retorna `{ success, organization_id, organization_name }`

---

## 2. Fluxo de Signup

```
1. Usuário preenche form: name, email, password, organization_name, phone
2. POST /api/auth/signup:
   a. Cria usuário no Supabase Auth (email_confirm: true)
   b. INSERT organizations { name, phone }
   c. INSERT profiles { id, full_name, active_organization_id, role: 'owner' }
   d. INSERT organization_users { organization_id, user_id, role: 'owner' }
   e. INSERT subscriptions { organization_id, plan: 'essencial', status: 'trial', trial_start, trial_end }
   f. Retorna { success, organization: { id, name }, trial_days: 7 }
3. Frontend: signInWithPassword → obtém sessão
4. setAuth imediato com org_id (ANTES do delay de UX)
5. Delay de UX (mínimo 800ms) → tela de loading premium
6. navigate('/') → Dashboard
```

**Rollback em caso de erro:**
```typescript
try { if (userId) await supabaseAdmin.auth.admin.deleteUser(userId) } catch {}
try { if (orgId)  await supabaseAdmin.from('organizations').delete().eq('id', orgId) } catch {}
```
(orphan cleanup — profiles/subscriptions cascadeiam com organizations/auth.users)

---

## 3. Fluxo de Onboarding

Para usuários que se autenticaram via OAuth ou signup parcial (sem organização):

```
1. App.tsx detecta: user autenticado + user.organization_id === undefined
   (após profileResolving=false)
2. Render: <Navigate to="/onboarding">
3. Onboarding.tsx:
   a. Guard: se organizationId já existe → navigate('/')
   b. Form: organization_name + phone (opcional)
   c. POST /api/auth/complete-setup com Bearer token
   d. Verifica se org já existe (idempotente)
   e. Cria org, upsert profile, cria organization_users, cria subscription
   f. setAuth com nova org_id
   g. navigate('/')
```

---

## 4. Loading Flow (profileResolving)

```
Condição para mostrar splash:  loading === true  ||  profileResolving === true

loading:
  - true: usuário não tem sessão persistida (primeira visita ou após logout)
  - false: sessão carregada do localStorage imediatamente (cold start rápido)

profileResolving:
  - true: user autenticado mas organization_id ainda não confirmado
  - false: fetchProfile retornou (com ou sem org)
  - Garante que o roteamento (onboarding vs app principal) só ocorre após saber o estado real
```

---

## 5. Multitenancy

**Regra de ouro:** `organization_id` nunca vem do frontend. Sempre derivado do backend:

```typescript
async function getOrgId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('active_organization_id')
    .eq('id', userId)
    .maybeSingle()
  return data?.active_organization_id ?? null
}
```

Todas as queries de dados (contacts, etc.) filtram por `organization_id` derivado desta função.

---

## 6. Regras de Redirecionamento

| Estado | Destino |
|--------|---------|
| `loading || profileResolving` | Splash screen (sem routing) |
| `!user` | `/login` (qualquer rota → `/login`), `/cadastro` acessível |
| `user && !organization_id` | `/onboarding` (qualquer rota → `/onboarding`) |
| `user && organization_id` | App completo; `/onboarding` → redirect para `/` |

---

## 7. Zustand — authStore

**Persistência:** `zustand/persist` com key `'auth-storage'` no localStorage.

**Campos críticos:**
```typescript
interface User {
  id, email, name, role, is_active
  plan, trial_active, trial_start, trial_end, trial_expired, trial_days_left
  organization_id    // ← derivado de profiles.active_organization_id
  organization_name  // ← nome da org para exibição
}
```

**Métodos:**
- `isTrialActive()` — trial dentro do prazo
- `isTrialExpired()` — trial fora do prazo
- `trialDaysLeft()` — dias restantes
- `getEffectivePlan()` → `'trial'` | plano pago | `'essencial'` fallback
- `hasPremiumAccess()` — trial ativo ou plano pago (não essencial)
- `checkAndExpireTrial()` — persiste `trial_active=false` se expirado
- `activateTrial()` — ativa trial de 7 dias manualmente

**Seletores — usar primitivos, não objetos:**
```typescript
// CORRETO (React 18 / Zustand v5):
const token = useAuthStore(s => s.token)
const orgId = useAuthStore(s => s.user?.organization_id)

// ERRADO (cria novo objeto a cada render → loop):
const { token, user } = useAuthStore(s => ({ token: s.token, user: s.user }))
```

---

## 8. Segurança

| Item | Status |
|------|--------|
| `.env` no `.gitignore` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` apenas no backend | ✅ |
| Frontend usa apenas `VITE_SUPABASE_ANON_KEY` | ✅ |
| `requireAuth` middleware em todas as rotas protegidas | ✅ |
| `organization_id` nunca vem do frontend | ✅ |
| Secrets não commitados | ✅ (`.env` no `.gitignore`) |

---

## 9. Variáveis de Ambiente

**Backend** (`api/` — Node.js):
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
NODE_ENV=
PORT=4000
```

**Frontend** (`src/` — Vite):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

---

## 10. Endpoints Backend Estáveis

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/signup` | público | Cria conta completa (user+org+profile+sub) |
| POST | `/api/auth/complete-setup` | Bearer | Finaliza setup para user sem org |
| GET | `/api/auth/profile` | Bearer | Retorna organization_id + name |
| POST | `/api/auth/login` | público | Login com email/senha (legado) |
| GET | `/api/contacts` | Bearer | Lista contatos da org (paginado, busca) |
| GET | `/api/contacts/:id` | Bearer | Busca contato por id |
| POST | `/api/contacts` | Bearer | Cria contato na org do usuário |
| PATCH | `/api/contacts/:id` | Bearer | Atualiza contato |
| DELETE | `/api/contacts/:id` | Bearer | Remove contato |
