# Comunicação

## Visão Geral

O core do WhatSchool é comunicação escolar. O sistema tem dois pilares:

1. **Announcements (Comunicados):** Staff envia comunicados para turmas ou alunos específicos. Entrega via PLATFORM + WhatsApp (opcional). Responsáveis podem responder (cria Conversation).
2. **Conversations (Conversas/Chat):** Thread de mensagens entre staff e responsável. Pode ser criada diretamente por staff ou como reply a um comunicado.

---

## Modelos de Dados

### `announcements` (Comunicados)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola |
| created_by_id | FK → users | Quem criou |
| category | AnnouncementCategory | Categoria |
| audience_type | AnnouncementAudienceType | Tipo de público-alvo |
| class_id | FK? → classes | Se audience=CLASS |
| student_id | FK? → students | Se audience=STUDENT |
| title | String | Título |
| content | Text | Corpo da mensagem |
| allow_replies | Boolean | Responsáveis podem responder? (default: true) |
| notify_via_whatsapp | Boolean | Enviar também por WhatsApp? (default: false) |
| requires_confirmation | Boolean | Exige confirmação manual de leitura? (default: false) |
| published_at | DateTime? | Data de publicação |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Indexes:** `(school_id, published_at)`, `(school_id, category)`, `(school_id, audience_type)`

### Enums

**AnnouncementCategory:**
| Valor | Descrição |
|-------|-----------|
| `COMUNICADOS` | Comunicados gerais |
| `BOLETOS` | Boletos e cobranças |
| `ATRASO_BOLETOS` | Atraso de boletos |
| `AVISOS` | Avisos gerais |

**AnnouncementAudienceType:**
| Valor | Descrição |
|-------|-----------|
| `ALL_SCHOOL` | Toda a escola (não implementado no MVP) |
| `CLASS` | Turma específica |
| `STUDENT` | Aluno específico |
| `CUSTOM` | Destinatários customizados (não implementado) |

### `announcement_recipients` (Tracking de entrega)

Uma entrada por destinatário **por provedor**. Se `notifyViaWhatsapp=true`, o mesmo usuário tem 2 registros: PLATFORM + WHATSAPP.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| announcement_id | FK → announcements | Comunicado |
| user_id | FK → users | Destinatário |
| provider | DeliveryProvider | PLATFORM ou WHATSAPP |
| status | DeliveryStatus | Estado da entrega |
| sent_at | DateTime? | Quando foi enviado |
| delivered_at | DateTime? | Confirmação de entrega |
| read_at | DateTime? | Quando foi lido |
| confirmed_at | DateTime? | Quando confirmou leitura (se requiresConfirmation) |
| provider_message_id | String? | ID no provedor externo |
| error_code | String? | Código de erro |
| error_message | String? | Mensagem de erro |

**Unique:** `(announcement_id, user_id, provider)` — um registro por provedor por destinatário.

**DeliveryStatus flow:** `PENDING → SENT → DELIVERED → READ → CONFIRMED` (ou `FAILED`)

> `CONFIRMED` só é usado quando `requiresConfirmation=true`. Ver [view-tracking.md](./view-tracking.md) para detalhes.

### `conversations` (Threads de chat)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| school_id | FK → schools | Escola |
| announcement_id | FK? → announcements | Se é reply a comunicado |
| parent_user_id | FK? → users | Responsável dono da conversa |
| status | ConversationStatus | OPEN ou CLOSED |
| subject | String? | Assunto (conversas diretas) |
| created_at | DateTime | — |
| updated_at | DateTime | — |

**Unique:** `(announcement_id, parent_user_id)` — máximo 1 thread por comunicado por responsável.

**Tipos implícitos (determinados por dados):**
- `announcement_id != null` → **Reply a comunicado** (lazy-created no primeiro reply)
- `announcement_id == null` → **Conversa direta** (subject obrigatório no app layer)

### `conversation_participants`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| conversation_id | FK → conversations | Conversa |
| user_id | FK → users | Participante |
| last_read_at | DateTime? | Último momento de leitura (para cálculo de unread) |

**Unique:** `(conversation_id, user_id)`

### `conversation_messages`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID PK | — |
| conversation_id | FK → conversations | Conversa |
| sender_id | FK → users | Remetente |
| body | Text | Conteúdo da mensagem |
| created_at | DateTime | — |

**Index:** `(conversation_id, created_at)` — ordenação eficiente de mensagens.

---

## Fluxo: Criação de Comunicado

```
POST /api/announcements
  → AnnouncementService.create(user, data)
    1. Validações (título, conteúdo, audienceType, classId/studentId)
    2. Resolve destinatários:
       - CLASS: busca todos os alunos ativos da turma →
               para cada aluno, busca responsáveis ativos via studentParents
       - STUDENT: busca responsáveis ativos do aluno específico via studentParents
    3. Verifica se há responsáveis (422 se vazio)
    4. prisma.$transaction:
       a. Cria Announcement
       b. Cria AnnouncementRecipient[] (provider=PLATFORM, status=SENT)
       c. Se notifyViaWhatsapp: cria AnnouncementRecipient[] (provider=WHATSAPP, status=PENDING)
    5. Se notifyViaWhatsapp:
       → Monta WhatsappJob[] com dados do comunicado
       → sendWhatsappJobsBatch(queueUrl, jobs) → SQS
```

### Payload de criação

```ts
{
  audienceType: "CLASS" | "STUDENT"
  classId?: string          // Obrigatório se CLASS
  studentId?: string        // Obrigatório se STUDENT
  title: string
  content: string           // ou "message"
  category: AnnouncementCategory
  notifyViaWhatsapp?: boolean  // Default: false
  allowReplies?: boolean       // Default: true
}
```

---

## Fluxo: Reply de Comunicado (Lazy Conversation)

```
POST /api/announcements/[id]/reply
  → AnnouncementService.reply(user, announcementId, message)
    1. Verifica se comunicado existe e se user é destinatário
    2. prisma.$transaction:
       a. Busca Conversation existente (announcementId + parentUserId)
       b. Se não existe → cria Conversation + 2 ConversationParticipants
          (staff criador + responsável)
       c. Cria ConversationMessage
       d. Atualiza lastReadAt do remetente
       e. Toca updatedAt da conversation
```

**Lazy creation:** A conversa só é criada quando o responsável responde pela primeira vez. Até lá, não existe registro em `conversations`.

**1 thread por responsável por comunicado:** Unique constraint `(announcementId, parentUserId)` garante que cada responsável tem no máximo 1 thread por comunicado.

---

## Fluxo: Conversa Direta

```
POST /api/conversations
  → ConversationService.create(user, { parentUserId, message, subject? })
    1. Verifica: só staff pode criar conversas diretas (PARENT não pode)
    2. Valida que o responsável existe e está ativo na mesma escola
    3. prisma.$transaction:
       a. Cria Conversation (sem announcementId, com subject)
       b. Cria 2 ConversationParticipants
       c. Cria primeira ConversationMessage
```

---

## Fluxo: Chat (Troca de mensagens)

### Enviar mensagem

```
POST /api/conversations/[id]/messages
  → ConversationService.sendMessage(user, conversationId, body)
    1. Verifica acesso: user é participante?
    2. Verifica status: conversa OPEN?
    3. prisma.$transaction:
       a. Cria ConversationMessage
       b. Atualiza lastReadAt do remetente
       c. Toca updatedAt da conversa
```

### Polling de novas mensagens

```
GET /api/conversations/[id]/poll?lastMessageId=...
  → ConversationService.poll(user, conversationId, lastMessageId)
    1. Verifica acesso
    2. Busca mensagens com createdAt > lastMessage.createdAt
    3. Retorna: { messages[], hasNewMessages, lastReadAt }
```

**Intervalo de polling:** Frontend faz polling a cada 5 segundos.

### Marcar como lido / Alterar status

```
PATCH /api/conversations/[id]
  → ConversationService.patchConversation(user, id, { action, status? })
    - action="mark_read" → atualiza lastReadAt do participante
    - action="update_status" → muda status (OPEN/CLOSED) — só staff
```

---

## Fluxo: WhatsApp Assíncrono

```
AnnouncementService.create() (notifyViaWhatsapp=true)
  → Monta WhatsappJob[] por destinatário
  → sendWhatsappJobsBatch(queueUrl, jobs)
    → AWS SQS SendMessageBatch (lotes de 10)
      → Lambda consumer (processo separado)
        → WhatsApp Cloud API (Meta)
```

### WhatsappJob payload

```ts
{
  version: 1,
  type: "WHATSAPP_ANNOUNCEMENT",
  announcementId: string,
  schoolId: string,
  schoolName: string,
  createdById: string,
  recipientUserId: string,
  recipientPhone: string | null,
  audienceType: string,
  classId: string | null,
  studentId: string | null,
  category: string,
  title: string,
  content: string,
  allowReplies: boolean,
  notifyViaWhatsapp: true,
  createdAt: string  // ISO 8601
}
```

---

## Services

### AnnouncementService (`src/lib/services/announcement.service.ts`)

| Método | Auth | Descrição |
|--------|------|-----------|
| `listForStaff(schoolId)` | ADMIN, SECRETARY, TEACHER | Lista todos os comunicados da escola |
| `listForParent(userId)` | PARENT | Lista comunicados onde é destinatário |
| `create(user, data)` | ADMIN, SECRETARY, TEACHER | Cria comunicado + recipients + SQS |
| `markRead(userId, announcementId)` | PARENT | Marca como visualizado (status → READ) |
| `confirm(userId, announcementId)` | PARENT | Confirma leitura (status → CONFIRMED) |
| `getRecipientDetails(schoolId, announcementId)` | STAFF | Lista destinatários com status de visualização/confirmação |
| `reply(user, announcementId, message)` | PARENT | Responde comunicado (lazy conversation) |

### ConversationService (`src/lib/services/conversation.service.ts`)

| Método | Auth | Descrição |
|--------|------|-----------|
| `list(user, filters)` | ADMIN, SECRETARY, TEACHER | Lista conversas com filtro (type, unread, search) |
| `getById(user, id)` | Qualquer participante | Detalhes com mensagens |
| `create(user, data)` | ADMIN, SECRETARY, TEACHER | Cria conversa direta com responsável |
| `sendMessage(user, id, body)` | Qualquer participante | Envia mensagem |
| `poll(user, id, lastMessageId)` | Qualquer participante | Polling de novas mensagens |
| `patchConversation(user, id, action)` | Participante / Staff | Mark read ou update status |
| `getStatus(user, id)` | Qualquer participante | Status da conversa + read receipts |
| `getBadges(user)` | Qualquer | Contagem de unread (chat + announcements) |

### ParentConversationService (`src/lib/services/parent-conversation.service.ts`)

Versão simplificada do ConversationService para a view do responsável.

| Método | Auth | Descrição |
|--------|------|-----------|
| `list(user)` | PARENT | Lista conversas do responsável |
| `getById(user, id)` | PARENT | Detalhes com mensagens |
| `sendMessage(user, id, body)` | PARENT | Envia mensagem |
| `poll(user, id, lastMessageId)` | PARENT | Polling |
| `markRead(user, id)` | PARENT | Marca como lida |
| `getStatus(user, id)` | PARENT | Status |

---

## Cálculo de Unread

### Chat (Conversations)
Compara `lastReadAt` do participante com `createdAt` da última mensagem:
```
unread = lastMessage.createdAt > participant.lastReadAt
```

### Comunicados (Announcements)
Verifica `readAt` no `AnnouncementRecipient`:
```
unread = recipient.readAt === null
```

### Badges (Header)
`ConversationService.getBadges()` retorna:
```ts
{ chatUnreadCount: number, announcementUnreadCount: number }
```
Usado no Header para mostrar badges de notificação.

---

## Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| AudienceType no MVP | Apenas CLASS e STUDENT (ALL_SCHOOL e CUSTOM não implementados) |
| Destinatários = responsáveis | Comunicados são enviados para os **responsáveis** dos alunos, não para os alunos |
| Só responsáveis ativos | `isActive=true` filtrado na resolução de destinatários |
| Reply lazy-creates conversation | Conversa só é criada no primeiro reply do responsável |
| 1 thread por responsável por comunicado | Unique `(announcementId, parentUserId)` |
| Staff cria conversas diretas | `PARENT` não pode criar — só responder |
| Conversa fechada bloqueia | `status=CLOSED` impede novas mensagens |
| Só staff altera status | `ADMIN`, `SECRETARY`, `TEACHER` podem fechar/reabrir |
| Polling a cada 5s | Frontend faz GET /poll com lastMessageId |
| SQS best-effort | Falha no SQS não impede criação do comunicado (PLATFORM sempre funciona) |
| Dual recipient tracking | Se WhatsApp ativado, mesmo user tem 2 AnnouncementRecipients (PLATFORM + WHATSAPP) |
