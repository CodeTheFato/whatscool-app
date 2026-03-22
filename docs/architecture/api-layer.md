# Camada de API — Service Layer e Utilities

## Visão Geral

A API usa um padrão de **service layer** onde:
- **Route handlers** são finos (~10-25 linhas): parse request, auth, validate, delegate, respond
- **Services** contêm toda a business logic: validações, transações, queries complexas
- **API utilities** eliminam boilerplate repetido (auth, errors, responses, validation)

## API Utilities (`src/lib/api/`)

### `auth.ts` — Auth Guards

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

// Retorna usuário autenticado ou lança ApiError(401/404)
async function requireAuth(): Promise<AuthUser>

// Requer roles específicas ou lança ApiError(403)
async function requireRole(roles: string[]): Promise<AuthUser>
```

### `errors.ts` — Error Handling

```ts
class ApiError extends Error {
  statusCode: number
  details?: unknown
}

// Converte ApiError → NextResponse com status code correto
// Qualquer outro erro → 500 com mensagem genérica
function handleApiError(error: unknown, fallbackMessage: string): NextResponse
```

### `response.ts` — Response Helpers

```ts
function success<T>(data: T, status = 200): NextResponse  // 200
function created<T>(data: T): NextResponse                 // 201
```

### `validation.ts` — Zod Validation

```ts
// Valida body contra schema Zod, lança ApiError(400) se inválido
function validateBody<T>(schema: ZodSchema<T>, body: unknown): T
```

## Services (`src/lib/services/`)

| Service | Arquivo | Responsabilidades |
|---------|---------|-------------------|
| `ClassService` | `class.service.ts` | create (auto-create AcademicYear), list |
| `SubjectService` | `subject.service.ts` | list |
| `SchoolService` | `school.service.ts` | CRUD completo + paginação + search |
| `StudentService` | `student.service.ts` | create (transaction: user+student+parents+tokens), update, list, getById |
| `TeacherService` | `teacher.service.ts` | create (transaction: user+teacher+assignments), update, list, getById |
| `AnnouncementService` | `announcement.service.ts` | create (recipients+SQS), list staff/parent, markRead, reply |
| `ConversationService` | `conversation.service.ts` | create, list, getById, sendMessage, poll, getStatus, getBadges |
| `ParentConversationService` | `parent-conversation.service.ts` | list, getById, sendMessage, poll, markRead, getStatus |
| `UserService` | `user.service.ts` | list, create (onboarding), activate, validateToken, resendActivation |

### Princípios dos Services

1. **Recebem dados validados** + `schoolId` (nunca `request`/`NextResponse`)
2. **Lançam `ApiError`** para erros de negócio (400, 403, 404, 409, 422)
3. **Retornam dados puros** (objetos/arrays), sem `NextResponse`
4. **Usam `prisma.$transaction`** para operações multi-entity
5. **São testáveis** independentemente dos route handlers

## Query Helpers (`src/lib/queries/`)

Queries reutilizáveis com formatação consistente:

| Helper | Arquivo | Uso |
|--------|---------|-----|
| `getSchoolStudents()` | `students.ts` | Lista alunos com parents formatados |
| `getTeacherStudents()` | `students.ts` | Lista alunos das turmas do professor |
| `getSchoolClasses()` | `classes.ts` | Lista turmas com teacher e contagem |
| `getTeacherClasses()` | `classes.ts` | Lista turmas vinculadas ao professor |
| `getRecipients()` | `recipients.ts` | Lista turmas+alunos para UI de comunicação |

## Validação (`src/lib/validations/`)

Schemas Zod usados tanto na API (server-side) quanto nos forms (client-side):

| Schema | Arquivo | Campos principais |
|--------|---------|-------------------|
| `classFormSchema` | `class.ts` | name, grade, shift, academicYear, maxStudents |
| `studentFormSchema` | `student.ts` | name, email, registrationId, guardian1, guardian2? |
| `studentUpdateSchema` | `student.ts` | Mesmos campos + status |
| `teacherFormSchema` | `teacher.ts` | name, email, cpf?, assignments[] |
| `teacherUpdateSchema` | `teacher.ts` | Mesmos campos |
| `schoolFormSchema` | `school.ts` | name, cnpj?, city, state, phone, email |
