# Banco de Dados — Schema Completo

## Visão Geral

- **ORM:** Prisma 7.x
- **Banco:** PostgreSQL
- **Schema:** Multi-file em `prisma/schema/` (10 arquivos por domínio)
- **Multi-tenant:** Toda tabela tem `school_id` (exceto auth tables)
- **IDs:** UUID (`@default(uuid())`)
- **Naming:** camelCase no Prisma, snake_case no banco (`@map`)

## Arquivos do Schema

| Arquivo | Conteúdo |
|---------|----------|
| `base.prisma` | Generator + datasource config |
| `auth.prisma` | User, Account, Session, VerificationToken |
| `school.prisma` | School |
| `student.prisma` | Student, Parent, StudentParent |
| `teacher.prisma` | Teacher |
| `class.prisma` | Class, Subject, ClassTeacher, Schedule |
| `academic.prisma` | AcademicYear, Attendance, Activity |
| `communication.prisma` | Announcement, AnnouncementRecipient, Conversation, ConversationParticipant, ConversationMessage |
| `authorization.prisma` | Authorization |
| `financial.prisma` | (vazio — removido do MVP) |

---

## Tabelas por Domínio

### Auth & Users

#### `users`
Tabela central de autenticação. Todo usuário pertence a uma escola.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | Escola do usuário |
| name | String | Nome completo |
| email | String | Email (unique por escola) |
| password | String | Hash bcrypt (vazio antes de ativação) |
| role | UserRole | ADMIN, SECRETARY, TEACHER, PARENT, STUDENT |
| avatar | String? | URL do avatar |
| phone | String? | Telefone |
| is_active | Boolean | false até ativação |

**Unique:** `(email, school_id)` — mesmo email pode existir em escolas diferentes.

**Relações 1:1:** `student`, `teacher`, `parent` — cada User pode ter no máximo um profile de cada tipo.

#### Enums: UserRole
`ADMIN` | `SECRETARY` | `TEACHER` | `PARENT` | `STUDENT`

#### `accounts`, `sessions`, `verification_tokens`
Tabelas padrão do NextAuth. `verification_tokens` também usada para tokens de ativação de conta.

---

### Schools

#### `schools`
Entidade central do multi-tenant. Toda query é scoped por escola.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| name | String | Nome da escola |
| cnpj | String? | CNPJ (unique) |
| school_type | String? | Tipo (infantil, fundamental, etc.) |
| student_count | String? | Faixa esperada de alunos (metadata) |
| city, state | String | Localização |
| phone, email | String | Contato principal |
| whatsapp | String? | Número WhatsApp |
| whatsapp_type | String? | Tipo (API, pessoal) |
| timezone | String | Default: "America/Sao_Paulo" |
| logo | String? | URL do logo |

---

### Students & Parents

#### `students`
Aluno matriculado. Sempre vinculado a um User (role=STUDENT).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| user_id | FK → users (unique) | Conta do aluno |
| school_id | FK → schools | - |
| registration_id | String | Matrícula (unique por escola) |
| date_of_birth | DateTime | Data de nascimento |
| cpf | String? | CPF do aluno |
| class_id | FK? → classes | Turma atual (null = sem turma) |
| status | StudentStatus | ACTIVE, INACTIVE, TRANSFERRED, GRADUATED |
| health_info | String? | Informações de saúde |

**Unique:** `(school_id, registration_id)`

#### `parents`
Responsável. Sempre vinculado a um User (role=PARENT).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| user_id | FK → users (unique) | Conta do responsável |
| school_id | FK → schools | - |
| cpf | String? | CPF |

**Index:** `school_id`

#### `student_parents` (Junction Table)
Vínculo explícito aluno-responsável com metadados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| student_id | FK → students | - |
| parent_id | FK → parents | - |
| kinship | String | Parentesco: "Pai", "Mãe", "Avô", "Responsável Legal", etc. |
| is_primary | Boolean | Responsável principal |
| can_pickup | Boolean | Pode buscar o aluno |
| is_emergency | Boolean | Contato de emergência |

**Unique:** `(student_id, parent_id)` — um parent não pode estar vinculado 2x ao mesmo student.

**Motivo da junction table:** Permite que o mesmo responsável tenha diferentes relações com diferentes alunos (ex: "pai" de um, "padrasto" de outro), além de metadados como `isPrimary` e `canPickup`.

---

### Teachers

#### `teachers`
Professor. Pode existir sem User (cadastro antes de ativar conta).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| user_id | FK? → users (unique) | Conta (opcional) |
| school_id | FK → schools | - |
| registration_id | String | Matrícula (unique por escola) |
| cpf | String? | CPF (unique por escola) |
| specialization | String? | Especialização |
| internal_notes | String? | Notas internas (só staff vê) |
| status | TeacherStatus | ACTIVE, INACTIVE, ON_LEAVE |

**Uniques:** `(school_id, registration_id)`, `(school_id, cpf)`

---

### Classes, Subjects & Schedule

#### `academic_years`
Ano letivo centralizado. Cada escola define seus anos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | - |
| year | Int | Ex: 2026 |
| is_current | Boolean | Ano letivo atual |

**Unique:** `(school_id, year)`

**Auto-criado:** Quando uma turma é criada com um ano novo, o `ClassService` cria o `AcademicYear` automaticamente.

#### `classes` (Turmas)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | - |
| academic_year_id | FK → academic_years | Ano letivo |
| name | String | Ex: "Turma A" |
| grade | String | Ex: "1º ano do Fundamental" |
| shift | Shift | MORNING, AFTERNOON, EVENING, FULL_TIME |
| max_students | Int | Capacidade (default 30) |

**Unique:** `(school_id, name, academic_year_id)`

#### `subjects` (Disciplinas)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | - |
| name | String | Ex: "Matemática" |
| workload | Int | Horas/semana |

**Unique:** `(school_id, name)`

#### `class_teachers` (Junction: Professor ↔ Turma ↔ Disciplina)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | - |
| class_id | FK → classes | - |
| teacher_id | FK → teachers | - |
| subject_id | FK? → subjects | Disciplina (null para MAIN) |
| role | ClassTeacherRole | MAIN, SUBJECT, ASSISTANT |

**Unique:** `(class_id, teacher_id, subject_id)`

**MAIN** = professor regente da turma (sem disciplina específica).
**SUBJECT** = professor de disciplina específica.

#### `schedules` (Horários)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | - |
| class_id | FK → classes | - |
| subject_id | FK → subjects | - |
| teacher_id | FK → teachers | - |
| day_of_week | Int | 0=Dom, 1=Seg, ..., 6=Sáb |
| start_time | Int | Minutos desde meia-noite (480 = 08:00) |
| end_time | Int | Minutos desde meia-noite (570 = 09:30) |
| room | String? | Sala |

**Unique:** `(class_id, day_of_week, start_time)` — impede conflito de horário.

---

### Communication

#### `announcements` (Comunicados)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | - |
| created_by_id | FK → users | Quem criou |
| category | AnnouncementCategory | COMUNICADOS, BOLETOS, ATRASO_BOLETOS, AVISOS |
| audience_type | AnnouncementAudienceType | ALL_SCHOOL, CLASS, STUDENT, CUSTOM |
| class_id | FK? → classes | Se audience=CLASS |
| student_id | FK? → students | Se audience=STUDENT |
| title | String | Título |
| content | Text | Corpo da mensagem |
| allow_replies | Boolean | Responsáveis podem responder? |
| notify_via_whatsapp | Boolean | Enviar também por WhatsApp? |
| published_at | DateTime? | Data de publicação |

#### `announcement_recipients` (Tracking de entrega)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| announcement_id | FK → announcements | - |
| user_id | FK → users | Destinatário |
| provider | DeliveryProvider | PLATFORM ou WHATSAPP |
| status | DeliveryStatus | PENDING → SENT → DELIVERED → READ / FAILED |
| sent_at, delivered_at, read_at | DateTime? | Timestamps de cada etapa |
| provider_message_id | String? | ID da mensagem no provedor externo |
| error_code, error_message | String? | Detalhes de falha |

**Unique:** `(announcement_id, user_id, provider)` — um recipient por provedor.

#### `conversations` (Threads de chat)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | - |
| school_id | FK → schools | - |
| announcement_id | FK? → announcements | Se é reply a um comunicado |
| parent_user_id | FK? → users | Responsável dono da conversa |
| status | ConversationStatus | OPEN, CLOSED |
| subject | String? | Assunto (conversas diretas) |

**Unique:** `(announcement_id, parent_user_id)` — máximo 1 thread por comunicado por responsável.

**Tipos implícitos:**
- `announcement_id != null` → reply a comunicado (lazy-created no primeiro reply)
- `announcement_id == null` → conversa direta (subject obrigatório)

#### `conversation_participants`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| conversation_id | FK → conversations | - |
| user_id | FK → users | - |
| last_read_at | DateTime? | Último read (para cálculo de unread) |

**Unique:** `(conversation_id, user_id)`

#### `conversation_messages`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| conversation_id | FK → conversations | - |
| sender_id | FK → users | - |
| body | Text | Conteúdo |

**Index:** `(conversation_id, created_at)` — para ordenação eficiente.

---

### Academic (Parcialmente implementado)

#### `attendances` (Frequência)
Schema pronto, sem API/pages. Vínculo: student + class + teacher + subject? + date.
**Unique:** `(student_id, class_id, subject_id, date)`

#### `activities` (Atividades)
Schema pronto, sem API/pages. Professor cria atividade para turma/disciplina com prazo.

---

### Authorization

#### `authorizations`
Schema pronto, sem API/pages. Tipos: FIELD_TRIP, MEDICATION, IMAGE_USE, EARLY_DISMISSAL, OTHER.
Status flow: PENDING → APPROVED/REJECTED.

---

## Diagrama de Relações Principais

```
School ──┬── User ──┬── Student ──── StudentParent ──── Parent
         │          ├── Teacher                           │
         │          └── Parent ◄──────────────────────────┘
         │
         ├── AcademicYear ──── Class ──── ClassTeacher ──── Teacher
         │                       │                            │
         │                       └── Student                  └── Subject
         │
         ├── Announcement ──── AnnouncementRecipient ──── User
         │        │
         │        └── Conversation ──── ConversationParticipant ──── User
         │                    │
         │                    └── ConversationMessage ──── User
         │
         └── Attendance, Activity, Schedule, Authorization
```
