# Arquitetura — Overview

## Camadas

```
┌──────────────────────────────────────────────┐
│  Frontend (Next.js App Router)               │
│  Pages → Components → Hooks                  │
├──────────────────────────────────────────────┤
│  API Routes (src/app/api/)                   │
│  Parse request → Auth → Validate → Response  │
├──────────────────────────────────────────────┤
│  API Utilities (src/lib/api/)                │
│  requireAuth, handleApiError, validateBody   │
├──────────────────────────────────────────────┤
│  Service Layer (src/lib/services/)           │
│  Business logic, validações, transações      │
├──────────────────────────────────────────────┤
│  Query Helpers (src/lib/queries/)            │
│  Queries reutilizáveis formatadas            │
├──────────────────────────────────────────────┤
│  Prisma ORM (src/lib/prisma.ts)             │
│  PostgreSQL                                  │
├──────────────────────────────────────────────┤
│  External (src/lib/aws/)                     │
│  SQS → Lambda → WhatsApp Cloud API          │
└──────────────────────────────────────────────┘
```

## Stack Técnica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 15 |
| Linguagem | TypeScript | strict |
| UI | shadcn/ui + Tailwind CSS | - |
| ORM | Prisma | 7.x |
| Banco | PostgreSQL | - |
| Auth | NextAuth (JWT) | 4.x |
| Validação | Zod | - |
| Fila | AWS SQS | - |
| Worker | AWS Lambda | - |
| WhatsApp | Cloud API (Meta) | - |

## Estrutura de Diretórios

```
src/
├── app/
│   ├── (auth)/              # Páginas de login/ativação
│   ├── (dashboard)/         # Páginas por role (admin, secretary, teacher, parents)
│   ├── (onboarding)/        # Wizard de setup inicial
│   └── api/                 # Route handlers (finos, ~10-25 linhas)
├── components/
│   ├── ui/                  # Componentes base (shadcn)
│   ├── layouts/             # Sidebar, Header
│   ├── auth/                # AuthProvider, AuthBranding
│   ├── communication/       # Chat, Announcements, Conversations
│   ├── students/            # Student CRUD components
│   ├── teachers/            # Teacher CRUD components
│   ├── classes/             # Class management
│   ├── dashboard/           # Stats, ActivityFeed
│   ├── onboarding/          # Stepper, steps
│   └── import/              # ImportWizard (CSV)
├── config/
│   └── sidebar-menus.ts     # Menu por role
├── hooks/
│   └── useCommunication.ts  # Hook de comunicação
├── lib/
│   ├── api/                 # Auth guard, error handler, response helpers, validation
│   ├── services/            # Business logic (9 services)
│   ├── queries/             # Query helpers reutilizáveis
│   ├── validations/         # Zod schemas
│   ├── aws/                 # SQS integration
│   ├── utils/               # Masks, helpers
│   ├── prisma.ts            # Prisma singleton
│   └── auth.ts              # NextAuth config
└── middleware.ts             # Role-based route protection
```

## Padrão de Route Handler

Cada route handler segue o mesmo padrão (~10-25 linhas):

```ts
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY"])
    const data = validateBody(schema, await request.json())
    const result = await Service.method(user.schoolId, data)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Mensagem de erro")
  }
}
```

## Autenticação

- **Provider:** Credentials (email + password)
- **Strategy:** JWT (30 dias de expiração)
- **Session data:** `{ id, email, name, role, schoolId, schoolName, avatar }`
- **Middleware:** Protege prefixos `/admin`, `/secretary`, `/teacher`, `/parents`
- **Role redirect:** Usuário com role errado é redirecionado ao seu dashboard

## Comunicação Assíncrona (WhatsApp)

```
POST /api/announcements (notifyViaWhatsapp: true)
  → AnnouncementService.create()
    → Prisma $transaction (announcement + recipients)
    → sendWhatsappJobsBatch(queueUrl, jobs)
      → SQS SendMessageBatch
        → Lambda consumer
          → WhatsApp Cloud API
```

## Multi-tenant

Toda query é scoped por `schoolId`:
- `requireAuth()` retorna `user.schoolId`
- Services recebem `schoolId` como primeiro parâmetro
- Prisma queries sempre incluem `where: { schoolId }`
- Um `User` pertence a exatamente uma `School`
