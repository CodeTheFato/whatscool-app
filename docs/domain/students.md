# Alunos e Responsáveis

## Visão Geral

O domínio de alunos é composto por três modelos: **Student** (aluno), **Parent** (responsável) e **StudentParent** (junction table com metadados do vínculo). Todo aluno e todo responsável têm um `User` associado (relação 1:1).

---

## Modelos de Dados

### `students`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| user_id | FK → users (unique) | Conta do aluno |
| school_id | FK → schools | Escola |
| registration_id | String | Matrícula (única por escola) |
| date_of_birth | DateTime | Data de nascimento |
| cpf | String? | CPF do aluno |
| address | String? | Endereço |
| city | String? | Cidade |
| state | String? | Estado |
| zip_code | String? | CEP |
| health_info | String? | Informações de saúde (alergias, medicações) |
| enrollment_date | DateTime | Data de matrícula (default: now) |
| status | StudentStatus | Status atual |
| class_id | FK? → classes | Turma atual (null = sem turma) |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(school_id, registration_id)` — matrícula única dentro da escola.

**Index:** `(school_id, status)` — filtro rápido por status.

### Enums: `StudentStatus`

| Valor | Descrição |
|-------|-----------|
| `ACTIVE` | Ativo (matriculado) |
| `INACTIVE` | Inativo |
| `TRANSFERRED` | Transferido |
| `GRADUATED` | Formado |

### `parents`

Responsável vinculado a um User (role=PARENT).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| user_id | FK → users (unique) | Conta do responsável |
| school_id | FK → schools | Escola |
| cpf | String? | CPF |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Index:** `(school_id)`

### `student_parents` (Junction Table)

Vínculo explícito entre aluno e responsável com metadados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| student_id | FK → students | Aluno |
| parent_id | FK → parents | Responsável |
| kinship | String | Parentesco: "Pai", "Mãe", "Avô", "Tio", "Responsável Legal", etc. |
| is_primary | Boolean | Responsável principal (default: false) |
| can_pickup | Boolean | Autorizado a buscar o aluno (default: true) |
| is_emergency | Boolean | Contato de emergência (default: false) |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(student_id, parent_id)` — um responsável não pode estar vinculado 2x ao mesmo aluno.

**Index:** `(parent_id)` — busca de alunos por responsável.

### Por que junction table explícita?

A tabela `student_parents` substitui o M:M implícito do Prisma porque:

1. **Parentesco por aluno:** O mesmo responsável pode ser "pai" de um aluno e "padrasto" de outro
2. **Metadados do vínculo:** `isPrimary`, `canPickup`, `isEmergency` são específicos de cada par aluno-responsável
3. **Queries eficientes:** Permite ordenar por `isPrimary` para obter responsável principal primeiro

---

## Fluxo de Criação de Aluno

A criação de aluno é uma **transação Prisma** que cria até 5 entidades de uma vez:

```
POST /api/students
  → StudentService.create(schoolId, data)
    → prisma.$transaction:
      1. Cria User (role=STUDENT, isActive=false, password="")
      2. Cria VerificationToken (ativação 48h)
      3. Cria Student (vinculado ao User)
      4. Cria User para Guardian1 (role=PARENT, se email novo)
         ou busca User existente (se email já cadastrado)
      5. Cria Parent (vinculado ao User do responsável)
      6. Cria StudentParent (kinship, isPrimary=true)
      7. Repete 4-6 para Guardian2 (se informado, isPrimary=false)
```

### Dados do formulário

```ts
{
  name: string           // Nome do aluno
  email: string          // Email do aluno
  registrationId: string // Matrícula
  dateOfBirth: string    // Data de nascimento
  cpf?: string           // CPF do aluno
  classId?: string       // Turma (opcional)
  healthInfo?: string    // Info de saúde

  guardian1Name: string  // Nome do responsável 1
  guardian1Email: string // Email do responsável 1
  guardian1Phone: string // Telefone do responsável 1
  guardian1Kinship: string // Parentesco (Pai, Mãe, etc.)

  guardian2Name?: string  // Responsável 2 (opcional)
  guardian2Email?: string
  guardian2Phone?: string
  guardian2Kinship?: string
}
```

---

## Fluxo de Atualização

```
PUT /api/students/[id]
  → StudentService.update(schoolId, id, data)
    → prisma.$transaction:
      1. Atualiza User do aluno (name, email, phone)
      2. Atualiza Student (dateOfBirth, cpf, classId, status, healthInfo)
      3. Atualiza dados do Guardian1:
         - Atualiza User do parent (name, email, phone)
         - Atualiza StudentParent (kinship)
      4. Se Guardian2 informado:
         - Se já existia: atualiza
         - Se é novo: cria User + Parent + StudentParent
      5. Se Guardian2 removido:
         - Deleta StudentParent
         - Se parent não tem outros vínculos: deleta Parent + User
```

---

## StudentService (`src/lib/services/student.service.ts`)

| Método | Auth | Descrição |
|--------|------|-----------|
| `list(schoolId)` | ADMIN, SECRETARY | Lista alunos com parents (via query helper) |
| `getById(schoolId, id)` | ADMIN, SECRETARY | Detalhes completos + parents + class |
| `create(schoolId, data)` | ADMIN, SECRETARY | Cria aluno + user + parents (transação) |
| `update(schoolId, id, data)` | ADMIN, SECRETARY | Atualiza aluno + parents (transação) |

---

## Query Helpers (`src/lib/queries/students.ts`)

### `getSchoolStudents(schoolId)`
Lista alunos da escola com responsáveis formatados.

**Retorno:**
```ts
{
  id, registrationId, status,
  user: { name, email },
  class: { name, grade } | null,
  parents: [
    { name, email, phone, kinship }  // Ordenados por isPrimary desc
  ]
}
```

### `getTeacherStudents(schoolId, teacherId)`
Lista alunos das turmas vinculadas ao professor (via `ClassTeacher`).

Mesmo formato de retorno, filtrado pelas turmas do professor.

---

## Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| Matrícula única por escola | `@@unique([schoolId, registrationId])` |
| Mínimo 1 responsável | Formulário exige `guardian1` |
| Máximo 2 responsáveis | Formulário permite `guardian1` + `guardian2` |
| Email do responsável reutilizável | Se já existe User com mesmo email na escola, reutiliza |
| Responsável principal | Primeiro guardião cadastrado é `isPrimary: true` |
| Deleção de parent órfão | Se um parent perde todos os StudentParent links, é deletado junto com seu User |
| Transação atômica | Criação/atualização de aluno é tudo-ou-nada |
