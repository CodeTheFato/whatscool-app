# Usuários e Autenticação

## Visão Geral

O sistema de autenticação usa **NextAuth v4** com strategy **JWT** e provider **Credentials** (email + senha). Todo usuário pertence a exatamente uma escola (`schoolId`).

---

## Modelo de Dados

### `users`

Tabela central de autenticação. Todo ator do sistema (admin, secretária, professor, responsável, aluno) é um User.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola do usuário |
| name | String | Nome completo |
| email | String | Email |
| password | String | Hash bcrypt (vazio antes de ativação) |
| role | UserRole | Papel do usuário |
| avatar | String? | URL do avatar |
| phone | String? | Telefone |
| is_active | Boolean | `false` até ativação da conta |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(email, school_id)` — o mesmo email pode existir em escolas diferentes.

**Index:** `(school_id, email)` — busca rápida por email dentro da escola.

### Enums: `UserRole`

| Valor | Descrição | Área no sistema |
|-------|-----------|-----------------|
| `ADMIN` | Administrador da escola | `/admin` |
| `SECRETARY` | Secretária | `/secretary` |
| `TEACHER` | Professor | `/teacher` |
| `PARENT` | Responsável (pai/mãe) | `/parents` |
| `STUDENT` | Aluno (não implementado no MVP) | — |

### Relações 1:1 (Profiles)

Cada User pode ter **no máximo um** profile de cada tipo:

| Profile | Model | Condição |
|---------|-------|----------|
| `user.student` | `Student` | Se `role = STUDENT` |
| `user.teacher` | `Teacher` | Se `role = TEACHER` |
| `user.parent` | `Parent` | Se `role = PARENT` |

Esses profiles armazenam dados específicos do domínio (matrícula, CPF, especialização, etc.).

---

## Tabelas NextAuth

### `accounts`
Tabela padrão do NextAuth para OAuth providers. No WhatSchool, usa apenas Credentials, então esta tabela existe para compatibilidade futura.

### `sessions`
Tabela de sessões. Com strategy JWT, sessões são armazenadas no token, não no banco. Existe para compatibilidade.

### `verification_tokens`
Usada para **tokens de ativação de conta**. Quando um usuário é criado, um token é gerado e armazenado aqui.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| identifier | String | Email do usuário |
| token | String (unique) | Token de ativação (hex 32 bytes) |
| expires | DateTime | Expiração (48h após criação) |

**Unique:** `(identifier, token)`

---

## Fluxo de Autenticação

### 1. Criação de Conta (Staff cria usuário)

```
Admin/Secretary cria usuário via API
  → UserService.create()
    → Cria User com password="" e isActive=false
    → Gera token aleatório (randomBytes 32)
    → Salva em VerificationToken (expira em 48h)
    → Loga link de ativação no console (email transacional pendente)
```

### 2. Ativação de Conta

```
Usuário acessa /activate?token=...
  → Frontend chama POST /api/users/validate-token
    → UserService.validateToken() → valida token + retorna dados do user
  → Usuário preenche nome e senha
  → Frontend chama POST /api/users/activate
    → UserService.activate()
      → Valida token (ou mock "123456" em dev)
      → Hash da senha (bcrypt, 10 rounds)
      → Update: password=hash, isActive=true
      → Deleta VerificationToken
```

### 3. Login

```
POST /api/auth/callback/credentials
  → NextAuth CredentialsProvider.authorize()
    → Busca user por email + isActive=true
    → Compara senha com bcrypt
    → Retorna dados para JWT: { id, email, name, role, schoolId, schoolName, avatar }
```

### 4. Session (JWT)

```
Token JWT contém:
  - id, email, name
  - role (UserRole)
  - schoolId, schoolName
  - avatar

Expiração: 30 dias
Custom pages: signIn → /login
```

### 5. Reenvio de Token

```
POST /api/users/resend-activation
  → UserService.resendActivation()
    → Busca user inativo por email
    → Deleta tokens anteriores
    → Gera novo token (48h)
    → Loga no console
    → Retorna mensagem genérica (segurança: não revela se email existe)
```

---

## Middleware de Proteção de Rotas

**Arquivo:** `src/middleware.ts`

Protege prefixos baseado em role:

| Prefixo | Role permitido |
|---------|---------------|
| `/admin/*` | ADMIN |
| `/secretary/*` | SECRETARY |
| `/teacher/*` | TEACHER |
| `/parents/*` | PARENT |

**Comportamento:**
1. Rota não protegida → passa direto
2. Sem token → redireciona para `/login?callbackUrl=...`
3. Role errado → redireciona para a área correta do usuário

---

## API Guards (`src/lib/api/auth.ts`)

### `requireAuth()`
Retorna o usuário autenticado ou lança `ApiError(401)`.

```ts
interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  schoolId: string
  phone: string | null
  isActive: boolean
}
```

Fluxo interno:
1. `getServerSession(authOptions)` → obtém session do JWT
2. `prisma.user.findUnique({ id })` → busca dados frescos no DB
3. Retorna `AuthUser` ou lança erro

### `requireRole(roles: string[])`
Chama `requireAuth()` + verifica se `user.role` está no array. Lança `ApiError(403)` se não.

**Uso típico nos route handlers:**
```ts
const user = await requireRole(["ADMIN", "SECRETARY"])
// user.schoolId garante scoping multi-tenant
```

---

## UserService (`src/lib/services/user.service.ts`)

| Método | Descrição |
|--------|-----------|
| `list(schoolId)` | Lista todos os usuários da escola |
| `create(schoolId, { name, email, role, phone? })` | Cria usuário inativo + token de ativação |
| `activate({ token, email, password })` | Ativa conta: valida token, hash senha, isActive=true |
| `validateToken({ token, email })` | Valida token sem ativar (para preencher form) |
| `resendActivation(email)` | Reenvio de token de ativação |

### Regras de Negócio

- Email único por escola (permite mesmo email em escolas diferentes)
- Senha mínima: 6 caracteres
- Token expira em 48 horas
- Token mock `"123456"` aceito em desenvolvimento
- `resendActivation` não revela se email existe (segurança)
- Conta criada com `isActive: false` e `password: ""` (vazio)
- Só contas com `isActive: true` conseguem fazer login
