# Auth Hardening Summary — Celeiro Digital

**Data:** 2026-05-20  
**Sessões:** 2 (contexto acumulado)  
**Estado:** estável, signup/login/onboarding funcionando end-to-end

---

## 1. Visão Geral

O Celeiro Digital é um SaaS multitenant ministerial. Cada usuário pertence a uma **organização** (igreja/empresa). Todos os dados são isolados por `organization_id`. O fluxo de autenticação usa **Supabase Auth** (JWT) no frontend e **supabaseAdmin** (service_role) no backend para operações privilegiadas.

---

## 2. Bugs Corrigidos

### 2.1 Loop infinito no `onAuthStateChange` + `fetchProfile`

**Arquivo:** `src/App.tsx`

**Causa raiz:** Havia chamadas paralelas a `supabase.auth.getSession()` e `supabase.auth.onAuthStateChange`. O evento `INITIAL_SESSION` já carrega a sessão atual; ter `getSession()` simultâneo causava dois `setAuth()` em sequência, que re-renderizavam o componente, que re-inscrevia o listener — loop.

**Correção:**
- Removido `getSession()` separado
- `onAuthStateChange` é o único source of truth (dispara `INITIAL_SESSION` na inscrição)
- Guard `let active = true` + cleanup `active = false` no useEffect para evitar zombie setState em StrictMode
- `profileResolving` boolean bloqueia decisões de rota até `fetchProfile` retornar

**Padrão atual (App.tsx):**
```
mount → onAuthStateChange → INITIAL_SESSION
  → setAuth imediato (sem org_id ainda)
  → setLoading(false)          ← UI unblocked
  → setProfileResolving(true)  ← routes blocked
  → await fetchProfile()
  → setAuth com org_id
  → setProfileResolving(false) ← routes unblocked
```

---

### 2.2 Resposta vazia no `/api/auth/signup` (empty body 500)

**Arquivo:** `api/routes/auth.ts`

**Causa raiz (encadeada):**
1. Supabase PostgREST builder implementa `PromiseLike` (só `.then()`), **não** `Promise` completo — `.catch()` **não existe**. O rollback usava `.catch(() => {})` → `TypeError: catch is not a function` dentro do bloco catch → Express não enviava resposta → body vazio.
2. Mesmo após fix do catch, `subscriptions_plan_check` constraint rejeitava `plan: 'trial'` (valor não existe no DB real).

**Correção:**
```typescript
// ANTES (quebrado):
supabaseAdmin.from('organizations').delete().eq('id', orgId).catch(() => {})

// DEPOIS (correto):
try { if (orgId) await supabaseAdmin.from('organizations').delete().eq('id', orgId) } catch {}
```

**Regra permanente:** Nunca usar `.catch()` em queries Supabase JS v2. Sempre `try { await } catch {}`.

---

### 2.3 Divergência de schema — `profiles.name` não existe

**Arquivo:** `api/routes/auth.ts` (INSERT profiles)

**Causa raiz:** Tabelas criadas manualmente no Supabase antes das migrations. `CREATE TABLE IF NOT EXISTS` foi no-op. Colunas da migration nunca foram adicionadas. A coluna real é `full_name`, não `name`.

**Correção:**
```typescript
// ANTES:
.insert({ id: userId, name: name.trim(), phone: phone.trim(), trial_end: trial.end })

// DEPOIS:
.insert({ id: userId, full_name: name.trim(), active_organization_id: org.id, role: 'owner' })
```

---

### 2.4 `organizations.plan` não existe

**Arquivo:** `api/routes/auth.ts` (INSERT organizations)

**Causa raiz:** Migration define `plan` em `organizations`, mas coluna não foi criada no DB real (a tabela já existia manualmente sem ela).

**Correção:** Removido `plan` do INSERT de organizations. Plan vive em `subscriptions`.

---

### 2.5 `subscriptions_plan_check` — valor 'trial' inválido

**Arquivo:** `api/routes/auth.ts` (INSERT subscriptions)

**Causa raiz:** Constraint real aceita `('essencial', 'pro', 'premium')`. A migration define `('trial', 'essencial', 'profissional', 'premium')` — diferem em nome e conjunto.

**Correção:**
```typescript
// ANTES:
{ plan: 'trial', status: 'active' }

// DEPOIS:
{ plan: 'essencial', status: 'trial' }
// trial_active é marcado via status='trial', não via plan
```

---

### 2.6 `setAuth` com `organization_id` após delay de UX

**Arquivo:** `src/pages/Signup.tsx`

**Causa raiz:** O delay de 800ms de UX ocorria **antes** de `setAuth` ser chamado com `organization_id`. O `onAuthStateChange` no App.tsx disparava durante o delay, via, encontrava user sem org, redirecionava para `/onboarding`.

**Correção:** `setAuth` com org_id chamado **antes** do delay:
```typescript
const storeUser = mapSupabaseUser(signInData.user!)
storeUser.organization_id   = json.organization?.id
storeUser.organization_name = json.organization?.name
setAuth(signInData.session?.access_token ?? '', storeUser)

// DEPOIS do setAuth:
const elapsed = Date.now() - startTime
if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed))
```

---

### 2.7 Erro genérico mascarando causa real no Signup

**Arquivos:** `src/pages/Signup.tsx`, `api/routes/auth.ts`

**Causa raiz:** Frontend fazia `await res.json()` sem try/catch — crashava quando body era vazio. Backend catch não retornava JSON estruturado.

**Correção frontend:**
```typescript
let json: Record<string, unknown> = {}
try { json = await res.json() } catch { /* non-JSON body */ }
if (!res.ok || !json.success) {
  if (import.meta.env.DEV) console.error('[signup] backend error:', json)
  throw new Error(
    import.meta.env.DEV && json.details
      ? `${json.error ?? 'Erro ao criar conta.'} — ${json.details}`
      : (json.error as string | undefined) ?? 'Erro ao criar conta.'
  )
}
```

**Correção backend:**
```typescript
res.status(500).json({
  success: false,
  error:   'Erro ao criar conta. Tente novamente.',
  code:    'SIGNUP_FAILED',
  ...(isDev && { details: (err as Error).message ?? String(err) }),
})
```

---

### 2.8 Contacts — dados mock em vez de Supabase

**Arquivo:** `api/routes/contacts.ts` (reescrito), `src/pages/AudiencePremium.tsx` (data layer)

**Causa raiz:** `contacts.ts` era 105 linhas de array em memória. Frontend não fazia nenhuma chamada à API.

**Correção:** Backend com 5 endpoints reais + isolamento multitenant:
- `organization_id` sempre derivado do profile do usuário autenticado (nunca do request body)
- `getOrgId(userId)` via `supabaseAdmin.from('profiles').select('active_organization_id')`
- Frontend: `fetchContacts`, `handleSaveContact`, `handleDeleteContact` todos via `/api/contacts`

---

## 3. Schema Real do Supabase (confirmado via REST API — 2026-05-19)

> As tabelas existiam manualmente antes das migrations. `CREATE TABLE IF NOT EXISTS` foi no-op.

### `profiles`
| Coluna | Tipo | Obs |
|--------|------|-----|
| id | uuid | PK, FK auth.users |
| full_name | text | ⚠️ migration diz `name` |
| avatar_url | text | |
| active_organization_id | uuid | FK organizations |
| role | text | ex: 'owner' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Não existem:** `name`, `phone`, `trial_end`

### `organizations`
| Coluna | Tipo | Obs |
|--------|------|-----|
| id | uuid | PK |
| name | text | |
| slug | text | |
| email | text | |
| phone | text | |
| city | text | |
| state | text | |
| status | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Não existe:** `plan` (vive em `subscriptions`)

### `subscriptions`
| Coluna | Tipo | Obs |
|--------|------|-----|
| id | uuid | PK |
| organization_id | uuid | FK organizations |
| plan | text | CHECK: `('essencial','pro','premium')` |
| status | text | CHECK: `('active','trial','past_due')` |
| trial_start | timestamptz | |
| trial_end | timestamptz | |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| payment_provider | text | |
| payment_customer_id | text | |
| payment_subscription_id | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Atenção:** `plan='trial'` **NÃO** é válido. Para trial: `plan='essencial'` + `status='trial'`.

### `organization_users`
| Coluna | Tipo | Obs |
|--------|------|-----|
| id | uuid | PK |
| organization_id | uuid | FK organizations |
| user_id | uuid | FK auth.users |
| role | text | |
| status | text | ⚠️ não estava na migration |
| created_at | timestamptz | |

### `contacts`
| Coluna | Tipo | Obs |
|--------|------|-----|
| id | uuid | PK |
| organization_id | uuid | FK organizations (multitenancy) |
| church_id | uuid | nullable |
| name | text | |
| email | text | |
| phone | text | |
| type | text | ex: 'visitante', 'membro' |
| status | text | ex: 'novo', 'ativo' |
| origin | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## 4. Diferenças de Nomenclatura — IDs de Organização

| Campo | Onde aparece | Significado |
|-------|-------------|-------------|
| `organization_id` | contacts, organization_users, subscriptions, Zustand store (`user.organization_id`) | FK para a organização |
| `active_organization_id` | profiles (coluna DB) | Organização ativa do perfil |
| `church_id` | contacts (coluna DB, nullable) | Referência histórica à "igreja" — não usar para multitenancy; usar `organization_id` |

**Regra:** Nunca confiar em `organization_id` vindo do frontend. Sempre derivar do `profiles.active_organization_id` do usuário autenticado no backend.

---

## 5. Arquivos Alterados

| Arquivo | Natureza |
|---------|----------|
| `api/routes/auth.ts` | signup: schema fixes (full_name, sem plan/phone/trial_end em profiles; subscriptions plan/status corretos); rollback fix (.catch → try/await/catch); /complete-setup: mesmas correções; /profile: retorna org info |
| `api/routes/contacts.ts` | Reescrito do zero: 5 endpoints reais Supabase, isolamento multitenant |
| `src/App.tsx` | Loop fix: single onAuthStateChange, guard `active`, `profileResolving` gate |
| `src/store/authStore.ts` | Adicionados campos `organization_id`, `organization_name`, trial helpers completos |
| `src/pages/Signup.tsx` | setAuth antes do delay; JSON parse gracioso; erro real em dev |
| `src/pages/Onboarding.tsx` | Nova página: /api/auth/complete-setup, guard vs org existente |
| `src/pages/AudiencePremium.tsx` | Data layer: fetchContacts, handleSaveContact, handleDeleteContact via API |
| `src/lib/apiFetch.ts` | Helper com timeout e auth token automático |
| `src/components/AppErrorBoundary.tsx` | Error boundary global |

---

## 6. Decisões Arquiteturais

- **service_role apenas no backend:** `api/lib/supabase.ts` exporta `supabaseAdmin` com SERVICE_ROLE_KEY. Frontend usa apenas `VITE_SUPABASE_ANON_KEY` → `supabase` client anon.
- **RLS bypass via supabaseAdmin:** Todas as operações de backend (signup, contacts, profile) usam `supabaseAdmin` que bypassa RLS — seguro porque o backend valida o JWT antes via `requireAuth` middleware.
- **`profileResolving` gate:** Bloqueia decisões de rota até `fetchProfile` retornar. Impede flash do onboarding para usuários com org já configurada.
- **Supabase JS v2 `PromiseLike`:** PostgREST builder só tem `.then()`. Nunca `.catch()`. Padrão: `try { await query } catch {}`.

---

## 7. Backlog de Hardening (não corrigido — fora do escopo)

- `api/lib/supabase.ts`: export `supabase` (não-admin) usa SERVICE_ROLE_KEY em vez de ANON_KEY — sem impacto funcional hoje pois só o backend usa, mas semanticamente incorreto
- `api/app.ts`: CORS wildcard `*` — restringir para domínios conhecidos em produção
- `api/routes/debug.ts`: desprotegida em produção — adicionar guard `process.env.NODE_ENV !== 'production'`
- `src/lib/apiFetch.ts`: `console.log('[DEBUG]...')` ativo — remover antes de produção
- Webhook WhatsApp: sem verificação HMAC
- `whatsappPersistence.ts`: sem isolamento de tenant
- Rotacionar secrets e remover do histórico git se já commitados
