# Escolas (Multi-tenant)

## Visão Geral

A `School` é a entidade central do multi-tenant. **Toda query no sistema é scoped por `schoolId`**. Um usuário pertence a exatamente uma escola. Dados de uma escola são completamente isolados de outra.

---

## Modelo de Dados

### `schools`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| name | String | Nome da escola |
| cnpj | String? (unique) | CNPJ |
| school_type | String? | Tipo: "infantil", "fundamental", "médio", etc. |
| student_count | String? | Faixa esperada de alunos (metadata de onboarding, ex: "100-500") |
| address | String? | Endereço completo |
| city | String | Cidade |
| state | String | Estado (UF) |
| zip_code | String? | CEP |
| phone | String | Telefone principal |
| email | String | Email principal |
| whatsapp | String? | Número WhatsApp da escola |
| whatsapp_type | String? | Tipo de WhatsApp ("api", "pessoal") |
| timezone | String | Fuso horário (default: "America/Sao_Paulo") |
| logo | String? | URL do logo |
| created_at | DateTime | — |
| updated_at | DateTime | — |

### Relações

A escola é o nó raiz — quase toda entidade no sistema tem FK para `schools`:

```
School
  ├── users[]
  ├── students[]
  ├── teachers[]
  ├── parents[]
  ├── classes[]
  ├── subjects[]
  ├── classTeachers[]
  ├── academicYears[]
  ├── attendances[]
  ├── activities[]
  ├── authorizations[]
  ├── schedules[]
  ├── announcements[]
  └── conversations[]
```

---

## Criação de Escola (Onboarding)

A escola é criada durante o onboarding multi-step:

```
1. Formulário de dados da escola (name, cnpj, city, state, phone, email, whatsapp)
2. SchoolService.create() → cria School no banco
3. Formulário de admin (name, email, password)
4. UserService.create() → cria User role=ADMIN vinculado à school
```

**Validações na criação:**
- `name`, `city`, `state`, `phone`, `email` são obrigatórios
- CNPJ, se informado, deve ser único no sistema

---

## SchoolService (`src/lib/services/school.service.ts`)

| Método | Auth | Descrição |
|--------|------|-----------|
| `create(data)` | — (onboarding) | Cria escola com validação de CNPJ único |
| `list({ page, limit, search })` | ADMIN | Lista com paginação + busca (nome, email, cidade, CNPJ) |
| `getById(id)` | ADMIN | Detalhes + contadores (students, teachers, classes, users) |
| `update(id, data)` | ADMIN | Atualiza campos parcialmente |
| `delete(id)` | ADMIN | Deleta se não tiver dados vinculados |

### Regras de Negócio

- **CNPJ único:** Duas escolas não podem ter o mesmo CNPJ
- **Delete protegido:** Não permite deletar escola que tenha alunos, professores ou turmas
- **Busca case-insensitive:** Pesquisa por nome, email, cidade ou CNPJ
- **Paginação:** Resposta inclui `{ schools, pagination: { page, limit, total, totalPages } }`

---

## Multi-tenant — Como Funciona

### No API Layer

```ts
// Route handler típico
export async function GET() {
  const user = await requireAuth()          // ← schoolId vem do JWT
  const result = await Service.list(user.schoolId) // ← scoping automático
  return success(result)
}
```

### Nos Services

```ts
// Toda query filtra por schoolId
const students = await prisma.student.findMany({
  where: { schoolId },  // ← SEMPRE presente
  ...
})
```

### No Middleware

O middleware não verifica `schoolId` diretamente — ele protege por **role**, e o `schoolId` é extraído do JWT em cada request de API.

### Garantias

| Regra | Implementação |
|-------|--------------|
| Isolamento de dados | `where: { schoolId }` em toda query |
| Scoping automático | `requireAuth()` retorna `user.schoolId` do JWT |
| Sem cross-school | Services recebem `schoolId` como parâmetro, não como query param |
| Um user = uma escola | `User.schoolId` é FK obrigatória (não nullable) |
