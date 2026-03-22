# Referência de Endpoints

## Visão Geral

- **Base URL:** `/api`
- **Auth:** JWT via NextAuth. Token enviado automaticamente via cookie.
- **Formato:** Request e response em JSON.
- **Erros:** `{ error: string, details?: unknown }` com status HTTP correto.

### Legenda de Auth

| Símbolo | Significado |
|---------|-------------|
| 🔓 | Público (sem autenticação) |
| 🔒 | Autenticado (qualquer role) |
| 👔 | ADMIN, SECRETARY |
| 📢 | ADMIN, SECRETARY, TEACHER |

---

## Health

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/health` | 🔓 | Health check |

---

## Auth & Users

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/[...nextauth]` | 🔓 | NextAuth handler (login via credentials) |
| GET | `/api/users` | 🔒 | Lista usuários da escola |
| POST | `/api/users` | 👔 | Cria usuário (gera token de ativação) |
| POST | `/api/users/validate-token` | 🔓 | Valida token de ativação (sem ativar) |
| POST | `/api/users/activate` | 🔓 | Ativa conta (define senha) |
| POST | `/api/users/resend-activation` | 🔓 | Reenvia token de ativação |

### `POST /api/users`
```json
// Request
{ "name": "string", "email": "string", "role": "ADMIN|SECRETARY|TEACHER|PARENT", "phone?": "string" }

// Response 201
{ "user": { "id", "name", "email", "role" }, "message": "string" }
```

### `POST /api/users/validate-token`
```json
// Request
{ "token": "string", "email": "string" }

// Response 200
{ "valid": true, "user": { "id", "name", "email", "role", "schoolId", "schoolName" } }
```

### `POST /api/users/activate`
```json
// Request
{ "token": "string", "email": "string", "password": "string" }

// Response 200
{ "success": true, "message": "string", "user": { "id", "name", "email", "role" } }
```

### `POST /api/users/resend-activation`
```json
// Request
{ "email": "string" }

// Response 200
{ "message": "string" }
```

---

## Schools

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/schools?page=1&limit=10&search=` | 🔓 | Lista escolas (paginado) |
| POST | `/api/schools` | 🔓 | Cria escola (onboarding) |
| GET | `/api/schools/[id]` | 🔓 | Detalhes da escola |
| PUT | `/api/schools/[id]` | 🔓 | Atualiza escola |
| DELETE | `/api/schools/[id]` | 🔓 | Deleta escola (se sem dados) |

> **Nota:** Endpoints de escolas são públicos no onboarding. Segurança será adicionada após MVP.

### `POST /api/schools`
```json
// Request
{
  "name": "string", "cnpj?": "string", "schoolType?": "string",
  "city": "string", "state": "string", "phone": "string", "email": "string",
  "whatsapp?": "string", "whatsappType?": "string"
}

// Response 201
{ "message": "string", "school": { "id", "name", "email", "city", "state" } }
```

### `PUT /api/schools/[id]`
```json
// Request (partial update)
{
  "schoolName?": "string", "taxId?": "string", "schoolType?": "string",
  "city?": "string", "state?": "string", "mainEmail?": "string",
  "officePhone?": "string", "whatsapp?": "string"
}

// Response 200
{ "message": "string", "school": { ...fullSchoolObject } }
```

---

## Students

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/students` | 👔 | Cria aluno + responsáveis |
| GET | `/api/students/[id]` | 🔒 | Detalhes do aluno |
| PUT | `/api/students/[id]` | 👔 | Atualiza aluno + responsáveis |

> **Nota:** Lista de alunos é obtida via query helper no frontend, não via endpoint dedicado de GET /students.

### `POST /api/students`
```json
// Request
{
  "name": "string", "email": "string",
  "registrationId": "string", "dateOfBirth": "YYYY-MM-DD",
  "cpf?": "string", "classId?": "string", "healthInfo?": "string",
  "guardian1Name": "string", "guardian1Email": "string",
  "guardian1Phone": "string", "guardian1Kinship": "string",
  "guardian2Name?": "string", "guardian2Email?": "string",
  "guardian2Phone?": "string", "guardian2Kinship?": "string"
}

// Response 201
{ "student": { "id", "name", "email", "registrationId" }, "message": "string" }
```

---

## Teachers

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/teachers` | 👔 | Cria professor + vínculos |
| GET | `/api/teachers/[id]` | 🔒 | Detalhes do professor |
| PUT | `/api/teachers/[id]` | 👔 | Atualiza professor + vínculos |

### `POST /api/teachers`
```json
// Request
{
  "name": "string", "email": "string", "phone": "string",
  "cpf?": "string", "dateOfBirth?": "YYYY-MM-DD",
  "registrationId?": "string", "specialization?": "string",
  "internalNotes?": "string", "observations?": "string",
  "assignments": [
    { "classId": "string", "subjectId?": "string", "role?": "MAIN|SUBJECT|ASSISTANT" }
  ]
}

// Response 201
{ "teacher": { "id", "name", "email", "registrationId" }, "message": "string" }
```

---

## Classes & Subjects

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/classes` | 🔒 | Lista turmas da escola |
| POST | `/api/classes` | 👔 | Cria turma (+ auto-create AcademicYear) |
| GET | `/api/subjects` | 🔒 | Lista disciplinas da escola |

### `POST /api/classes`
```json
// Request
{
  "name": "string", "grade": "string",
  "shift": "MORNING|AFTERNOON|EVENING|FULL_TIME",
  "academicYear": 2026, "maxStudents": 30
}

// Response 201
{ "id", "name", "grade", "shift", "academicYear", "maxStudents", "teacher": null, "message": "string" }
```

---

## Announcements

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/announcements` | 🔒 | Lista comunicados (staff: todos / parent: seus) |
| POST | `/api/announcements` | 📢 | Cria comunicado |
| PATCH | `/api/announcements/[id]/read` | 🔒 | Marca comunicado como lido |
| POST | `/api/announcements/[id]/reply` | 🔒 | Responde comunicado (lazy conversation) |

### `POST /api/announcements`
```json
// Request
{
  "audienceType": "CLASS|STUDENT",
  "classId?": "string", "studentId?": "string",
  "title": "string", "content": "string",
  "category": "COMUNICADOS|BOLETOS|ATRASO_BOLETOS|AVISOS",
  "notifyViaWhatsapp?": false, "allowReplies?": true
}

// Response 201
{
  "announcement": { "id", "title", "content", "category", "audienceType", ... },
  "stats": {
    "recipientsCount": 15,
    "providers": ["PLATFORM", "WHATSAPP"],
    "platform": { "count": 15, "status": "SENT" },
    "whatsapp?": { "count": 15, "status": "PENDING", "queueEnqueued": true, ... }
  }
}
```

### `POST /api/announcements/[id]/reply`
```json
// Request
{ "message": "string" }

// Response 200
{
  "conversationId": "uuid",
  "message": { "id", "content", "createdAt", "sender": { "id", "name", "role", "avatar" } }
}
```

---

## Chat — Staff Conversations

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/chat/conversations` | 🔒 | Lista conversas (filtros: type, unread, search) |
| POST | `/api/chat/conversations` | 🔒 | Cria conversa direta |
| GET | `/api/chat/conversations/[id]` | 🔒 | Detalhes + mensagens |
| PATCH | `/api/chat/conversations/[id]` | 🔒 | Mark read / update status |
| POST | `/api/chat/conversations/[id]/messages` | 🔒 | Envia mensagem |
| GET | `/api/chat/conversations/[id]/poll?lastMessageId=` | 🔒 | Polling novas mensagens |
| GET | `/api/chat/conversations/[id]/status` | 🔒 | Status + read receipts |
| GET | `/api/chat/conversations/badges` | 🔒 | Contagem de unread |

### `POST /api/chat/conversations`
```json
// Request
{ "parentUserId": "string", "message": "string", "subject?": "string" }

// Response 201
{ "id": "uuid", "message": "Conversa criada com sucesso" }
```

### `POST /api/chat/conversations/[id]/messages`
```json
// Request
{ "message": "string" }

// Response 200
{ "id", "body", "createdAt", "sender": { "id", "name", "role", "avatar" } }
```

### `PATCH /api/chat/conversations/[id]`
```json
// Request
{ "action": "mark_read" }
// or
{ "action": "update_status", "status": "OPEN|CLOSED" }
```

### `GET /api/chat/conversations/badges`
```json
// Response 200
{ "chatUnreadCount": 3, "announcementUnreadCount": 5 }
```

---

## Chat — Parent Conversations

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/parents/conversations` | 🔒 | Lista conversas do responsável |
| GET | `/api/parents/conversations/[id]` | 🔒 | Detalhes + mensagens |
| POST | `/api/parents/conversations/[id]` | 🔒 | Envia mensagem |
| GET | `/api/parents/conversations/[id]/poll?lastMessageId=` | 🔒 | Polling |
| POST | `/api/parents/conversations/[id]/mark-read` | 🔒 | Marca como lida |
| GET | `/api/parents/conversations/[id]/status` | 🔒 | Status da conversa |

### `POST /api/parents/conversations/[id]`
```json
// Request
{ "message": "string" }

// Response 200
{ "id", "body", "createdAt", "sender": { ... } }
```

---

## Resumo por Role

### ADMIN / SECRETARY
Acesso completo: CRUD alunos, professores, turmas, comunicados, conversas, gestão de usuários.

### TEACHER
Pode: criar comunicados, listar turmas/alunos/disciplinas, participar de conversas.
Não pode: CRUD de alunos/professores/turmas, gestão de usuários.

### PARENT
Pode: ver comunicados onde é destinatário, responder comunicados, participar de conversas.
Não pode: criar conversas diretamente, CRUD de nenhuma entidade.

### Público (sem auth)
Health check, onboarding (escola + ativação), validação de tokens.
