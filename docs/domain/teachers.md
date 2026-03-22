# Professores

## Visão Geral

O professor (`Teacher`) é vinculado a turmas e disciplinas através da junction table `ClassTeacher`. Um professor pode ter múltiplos vínculos (várias turmas, várias disciplinas). O `Teacher` tem relação 1:1 opcional com `User` — pode existir sem conta ativada.

---

## Modelos de Dados

### `teachers`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| user_id | FK? → users (unique) | Conta do professor (opcional) |
| school_id | FK → schools | Escola |
| registration_id | String | Matrícula (única por escola) |
| cpf | String? | CPF (único por escola, se informado) |
| date_of_birth | DateTime? | Data de nascimento |
| address | String? | Endereço |
| city | String? | Cidade |
| state | String? | Estado |
| zip_code | String? | CEP |
| specialization | String? | Especialização/formação |
| internal_notes | String? | Notas internas (só staff vê) |
| hire_date | DateTime | Data de contratação (default: now) |
| status | TeacherStatus | Status atual |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Uniques:** `(school_id, registration_id)`, `(school_id, cpf)`

**Index:** `(school_id, status)`

### Enums: `TeacherStatus`

| Valor | Descrição |
|-------|-----------|
| `ACTIVE` | Ativo |
| `INACTIVE` | Inativo |
| `ON_LEAVE` | Licença/afastamento |

### `class_teachers` (Junction: Professor ↔ Turma ↔ Disciplina)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola |
| class_id | FK → classes | Turma |
| teacher_id | FK → teachers | Professor |
| subject_id | FK? → subjects | Disciplina (null para MAIN) |
| role | ClassTeacherRole | Tipo de vínculo |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(class_id, teacher_id, subject_id)` — impede vínculo duplicado.

**Indexes:** `(school_id, class_id)`, `(school_id, teacher_id)`

### Enums: `ClassTeacherRole`

| Valor | Descrição | subject_id |
|-------|-----------|------------|
| `MAIN` | Professor regente da turma | null (não tem disciplina específica) |
| `SUBJECT` | Professor de disciplina | obrigatório |
| `ASSISTANT` | Professor auxiliar | opcional |

---

## Fluxo de Criação

```
POST /api/teachers
  → TeacherService.create(schoolId, data)
    → Validações: email único, CPF único, matrícula única
    → validateAssignments(): verifica se turmas e disciplinas existem na escola
    → prisma.$transaction:
      1. Cria User (role=TEACHER, isActive=false, password="")
      2. Cria Teacher (vinculado ao User)
      3. Cria ClassTeacher[] (vínculos turma-disciplina)
```

### Dados do formulário

```ts
{
  name: string              // Nome (min 3 chars)
  email: string             // Email
  phone: string             // Telefone
  cpf?: string              // CPF (auto-unmasked)
  dateOfBirth?: string      // Data nascimento
  registrationId?: string   // Matrícula (auto-gerada se não informada: PROF-XXXXX)
  specialization?: string   // Especialização
  internalNotes?: string    // Notas internas
  observations?: string     // Observações (concatena com internalNotes)
  assignments: [            // Vínculos (opcional na criação)
    {
      classId: string       // Turma
      subjectId?: string    // Disciplina (null para MAIN)
      role: "MAIN" | "SUBJECT" | "ASSISTANT"  // Default: SUBJECT
    }
  ]
}
```

---

## Fluxo de Atualização

```
PUT /api/teachers/[id]
  → TeacherService.update(schoolId, id, data)
    → Validações: email, CPF, matrícula (excluindo o próprio registro)
    → prisma.$transaction:
      1. Atualiza User (name, email, phone)
      2. Atualiza Teacher (dados pessoais + status)
      3. Delete-and-recreate ClassTeacher[]:
         - Deleta TODOS os vínculos existentes
         - Cria novos (full replacement)
```

**Estratégia de assignments:** Full replacement — na atualização, todos os vínculos antigos são deletados e os novos são criados. Simplifica a lógica de diff (evita reconciliação de updates individuais).

---

## TeacherService (`src/lib/services/teacher.service.ts`)

| Método | Auth | Descrição |
|--------|------|-----------|
| `list(schoolId)` | ADMIN, SECRETARY, TEACHER | Lista via query helper |
| `getById(schoolId, id)` | ADMIN, SECRETARY | Detalhes + assignments formatados |
| `create(schoolId, data)` | ADMIN, SECRETARY | Cria professor + user + vínculos (transação) |
| `update(schoolId, id, data)` | ADMIN, SECRETARY | Atualiza tudo (transação, full replacement de assignments) |

---

## Query Helper (`src/lib/queries/teachers.ts`)

### `getSchoolTeachers(schoolId)`

**Retorno:**
```ts
{
  id, registrationId, status, specialization,
  user: { name, email, phone, isActive },
  classTeachers: [
    { class: { name }, subject: { name }, role }
  ]
}
```

---

## Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| Email único por escola | Verifica antes de criar/atualizar |
| CPF único por escola | `@@unique([schoolId, cpf])` + verificação no service |
| Matrícula única por escola | `@@unique([schoolId, registrationId])` |
| Matrícula auto-gerada | Se não informada: `PROF-${Date.now().toString(36).toUpperCase()}` |
| CPF/phone auto-unmasked | `unmask()` remove pontuação antes de salvar |
| Assignments são validados | Turmas e disciplinas devem existir na escola |
| Teacher pode existir sem User | `userId` é optional — suporta cadastro antes da ativação |
| Full replacement de vínculos | Update deleta todos e recria (não faz diff) |
