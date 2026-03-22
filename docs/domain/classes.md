# Turmas, Disciplinas e Horários

## Visão Geral

O domínio acadêmico é composto por: **AcademicYear** (ano letivo), **Class** (turma), **Subject** (disciplina), **ClassTeacher** (vínculo professor-turma-disciplina), e **Schedule** (horários). No MVP, apenas turmas e disciplinas têm CRUD completo. Schedule e AcademicYear são gerenciados indiretamente.

---

## Modelos de Dados

### `academic_years`

Ano letivo centralizado. Auto-criado pelo `ClassService` quando uma turma é criada com um ano novo.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola |
| year | Int | Ex: 2026 |
| is_current | Boolean | Ano letivo atual (default: false) |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(school_id, year)` — um ano letivo por escola.

**Auto-criação:** Quando `ClassService.create()` recebe `academicYear: 2026` e o `AcademicYear` não existe, ele é criado automaticamente com `isCurrent: true`.

### `classes` (Turmas)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola |
| academic_year_id | FK → academic_years | Ano letivo |
| name | String | Nome da turma (ex: "Turma A", "3º B") |
| grade | String | Série (ex: "1º ano do Fundamental") |
| shift | Shift | Turno |
| max_students | Int | Capacidade máxima (default: 30) |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(school_id, name, academic_year_id)` — nome único por ano letivo na escola.

**Index:** `(school_id, academic_year_id)`

### Enums: `Shift`

| Valor | Descrição |
|-------|-----------|
| `MORNING` | Manhã |
| `AFTERNOON` | Tarde |
| `EVENING` | Noite |
| `FULL_TIME` | Integral |

### `subjects` (Disciplinas)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola |
| name | String | Nome (ex: "Matemática", "Português") |
| description | String? | Descrição |
| workload | Int | Carga horária semanal (horas) |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(school_id, name)` — nome único por escola.

### `schedules` (Horários)

Schema pronto, sem API/pages no MVP.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola |
| class_id | FK → classes | Turma |
| subject_id | FK → subjects | Disciplina |
| teacher_id | FK → teachers | Professor |
| day_of_week | Int | Dia da semana: 0=Dom, 1=Seg, ..., 6=Sáb |
| start_time | Int | Minutos desde meia-noite (480 = 08:00) |
| end_time | Int | Minutos desde meia-noite (570 = 09:30) |
| room | String? | Sala de aula |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(class_id, day_of_week, start_time)` — impede conflito de horário na mesma turma.

**Formato de tempo:** Inteiros representando minutos desde meia-noite. Exemplos:
- 08:00 = 480
- 09:30 = 570
- 12:00 = 720
- 18:00 = 1080

Esse formato permite range queries nativas no DB (ex: "horários entre 08:00 e 10:00" = `WHERE start_time >= 480 AND start_time < 600`).

---

## Fluxo de Criação de Turma

```
POST /api/classes
  → ClassService.create(schoolId, data)
    1. Find-or-create AcademicYear:
       → prisma.academicYear.findUnique({ schoolId, year })
       → Se não existe: prisma.academicYear.create({ schoolId, year, isCurrent: true })
    2. Verifica duplicidade: nome + academicYear na escola
    3. Cria Class com academicYearId
```

### Dados do formulário

```ts
{
  name: string          // Nome da turma (min 3 chars)
  grade: string         // Série
  shift: Shift          // Turno (MORNING, AFTERNOON, EVENING, FULL_TIME)
  academicYear: number  // Ano letivo (2000-2100)
  maxStudents: number   // Capacidade (min 1)
}
```

**Transparência:** O frontend envia `academicYear` como número (ex: 2026). O service resolve para FK internamente — o frontend não precisa saber que `AcademicYear` é uma tabela separada.

---

## ClassService (`src/lib/services/class.service.ts`)

| Método | Auth | Descrição |
|--------|------|-----------|
| `list(schoolId)` | ADMIN, SECRETARY, TEACHER | Lista via query helper |
| `create(schoolId, data)` | ADMIN, SECRETARY | Cria turma (+ auto-create AcademicYear) |

---

## Query Helpers (`src/lib/queries/classes.ts`)

### `getSchoolClasses(schoolId)`

**Retorno:**
```ts
{
  id, name, grade, shift, maxStudents,
  academicYear: number,        // Extraído de academicYear.year
  _count: { students: number },
  teacher: string | null        // Nome do professor MAIN (se houver)
}
```

Ordenado por `academicYear.year DESC` (anos mais recentes primeiro).

### `getTeacherClasses(schoolId, teacherId)`

Mesma estrutura, filtrado por turmas onde o professor tem `ClassTeacher` ativo.

---

## Modelos Futuros (Schema pronto, sem API)

### `Attendance` (Frequência)
Chamada digital por turma/disciplina. Status: PRESENT, ABSENT, LATE, EXCUSED.

**Unique:** `(student_id, class_id, subject_id, date)` — uma chamada por aluno por aula por dia.

### `Activity` (Atividades)
Professor cria atividades com prazo para turma/disciplina. Sem submissions no MVP.

---

## Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| Nome de turma único por ano | `@@unique([schoolId, name, academicYearId])` |
| AcademicYear auto-criado | Service cria AcademicYear se não existir |
| Nome de disciplina único por escola | `@@unique([schoolId, name])` |
| Horário sem conflito | `@@unique([classId, dayOfWeek, startTime])` por turma |
| Tempo em minutos | Schedule usa Int (minutos desde meia-noite), não String |
| Um professor MAIN por turma | ClassTeacher com role=MAIN não tem subject_id |
| Aluno em uma turma | `Student.classId` é FK direta (1:N, não M:N) |
