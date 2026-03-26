# Controle de Visualização e Confirmação de Leitura

## Visão Geral

O WhatSchool possui um sistema de rastreamento de visualização que permite à escola acompanhar quem abriu comunicados, lições de casa e eventos na plataforma. Adicionalmente, comunicados podem exigir **confirmação manual de leitura** pelo responsável.

| Recurso | Visualização automática | Confirmação manual |
|---------|------------------------|--------------------|
| Comunicados | Sim | Opcional (por comunicado) |
| Lições de Casa | Sim | Não |
| Eventos | Sim | Não |

**Princípio fundamental:** O tracking é feito na **plataforma** (provider=PLATFORM), não no WhatsApp. O WhatsApp é apenas um canal de notificação — a visualização real é registrada quando o responsável abre o item no app.

---

## 1. Comunicados (Announcements)

### 1.1 Campos relevantes

**Tabela `announcements`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| requires_confirmation | Boolean (default: false) | Se `true`, exige confirmação manual do responsável |

**Tabela `announcement_recipients`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| read_at | DateTime? | Quando o responsável abriu o comunicado |
| confirmed_at | DateTime? | Quando o responsável confirmou a leitura |
| status | DeliveryStatus | Estado atual do tracking |

**DeliveryStatus (enum):**

```
PENDING → SENT → DELIVERED → READ → CONFIRMED → FAILED
```

- `READ` = responsável abriu o comunicado na plataforma
- `CONFIRMED` = responsável clicou no botão "Confirmar leitura" (só se `requiresConfirmation=true`)

### 1.2 Fluxo — Visualização automática (zero fricção)

```
Responsável clica no card do comunicado
  → handleSelectAnnouncement() no hook useCommunication
    → Se readAt === null:
      → PATCH /api/announcements/[id]/read (optimistic update)
        → AnnouncementService.markRead(userId, announcementId)
          → UPDATE announcement_recipients
              SET read_at = NOW(), status = 'READ'
              WHERE user_id = :userId
                AND announcement_id = :announcementId
                AND provider = 'PLATFORM'
                AND read_at IS NULL
```

- A marcação é **automática** ao abrir — sem nenhuma ação extra do responsável
- Optimistic update: o card já reflete "Visualizado" antes da resposta do server
- Idempotente: se já foi lido, retorna "Comunicado já marcado como lido"

### 1.3 Fluxo — Confirmação manual de leitura

Só aparece quando o comunicado foi criado com `requiresConfirmation: true`.

```
Responsável abre o comunicado (read automático acontece acima)
  → Vê botão "Confirmar que li este comunicado"
  → Clica no botão
    → handleConfirm() no hook useCommunication
      → PATCH /api/announcements/[id]/confirm (optimistic update)
        → AnnouncementService.confirm(userId, announcementId)
          → Valida: comunicado exige confirmação?
          → UPDATE announcement_recipients
              SET confirmed_at = NOW(), status = 'CONFIRMED'
              (também seta read_at se ainda não foi setado)
```

Após confirmar, o botão é substituído por feedback visual: "Confirmado em DD/MMM às HH:MM".

### 1.4 Criação de comunicado com confirmação

No formulário de criação (`NewCommunicationModal`), o staff pode ativar o toggle "Exigir confirmação de leitura". Isso seta `requiresConfirmation: true` no payload.

```
POST /api/announcements
{
  ...
  requiresConfirmation: true  // opcional, default: false
}
```

### 1.5 Visão do staff — Painel de rastreabilidade

Quando o staff clica em um comunicado, abre o `AnnouncementRecipientsPanel` com:

1. **Conteúdo do comunicado** (título + corpo com line-clamp)
2. **Stats agregados:**
   - "X de Y visualizaram" (baseado em `readAt !== null`)
   - "X de Y confirmaram" (baseado em `confirmedAt !== null`, só se `requiresConfirmation`)
3. **Lista por destinatário** com status individual:
   - Pendente (cinza, ícone relógio) — não abriu
   - Visualizado (azul, ícone olho) — abriu, ainda não confirmou
   - Confirmado (verde, ícone check duplo) — confirmou leitura

**Contagem PLATFORM-only:** As stats consideram apenas recipients com `provider=PLATFORM`, ignorando registros de WHATSAPP (que são tracking de entrega, não de visualização).

### 1.6 Visão do responsável

- Card mostra "Visualizado" (ícone olho, azul) após abrir
- Card mostra "Confirmado" (ícone check duplo, verde) após confirmar
- Se `requiresConfirmation`, o painel de resposta mostra botão de confirmação ou feedback de já confirmado
- **Responsáveis NÃO veem** o painel de tracking (quem leu/confirmou) — isso é exclusivo do staff

### 1.7 Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| PATCH | `/api/announcements/[id]/read` | PARENT | Marca como visualizado |
| PATCH | `/api/announcements/[id]/confirm` | PARENT | Confirma leitura |
| GET | `/api/announcements/[id]/recipients` | STAFF | Lista destinatários com status |

---

## 2. Atividades — Lições de Casa e Eventos

### 2.1 Campos relevantes

**Tabela `activity_recipients`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| read_at | DateTime? | Quando o responsável abriu a atividade |
| status | DeliveryStatus | Estado atual (SENT → READ) |

Atividades **não possuem** confirmação de leitura — apenas tracking de visualização automática.

### 2.2 Criação de recipients

Recipients PLATFORM são criados **sempre** que uma atividade é criada (`sendToParents` é `true` por padrão). O toggle de WhatsApp no formulário controla apenas a notificação adicional, não a existência de recipients.

```
Criar atividade (sendToParents=true por padrão)
  → Cria ActivityRecipient por pai (provider=PLATFORM, status=SENT)
  → Se notifyWhatsapp=true:
    → Cria ActivityRecipient adicional (provider=WHATSAPP, status=PENDING)
    → Envia jobs para SQS
```

### 2.3 Fluxo — Visualização automática

```
Responsável clica no card da atividade (lista ou calendário)
  → Se item.unread:
    → PATCH /api/parents/activities/[id]/read (optimistic update)
      → ActivityService.markRead(activityId, userId)
        → UPDATE activity_recipients
            SET read_at = NOW(), status = 'READ'
            WHERE activity_id = :activityId
              AND user_id = :userId
              AND provider = 'PLATFORM'
              AND read_at IS NULL
  → Abre ActivityDetailModal com detalhes da atividade
```

Funciona nas duas páginas que o responsável pode acessar:
- **Agenda Escolar** (`ParentActivitiesPage`) — lista de atividades
- **Calendário Escolar** (`ParentCalendarPage`) — visualização em calendário

### 2.4 Visão do staff — Stats e detalhe

**Card da atividade (lista):**
- Mostra "X/Y visualizaram" com ícone de olho

**Modal de detalhe (`ActivityDetailModal`):**
- Progress bar: X de Y visualizaram
- Lista por destinatário:
  - Visualizado (azul, ícone olho) com data/hora
  - Pendente (cinza, ícone olho fechado)

**Contagem PLATFORM-only:** Tanto `listForSchool` quanto `listForTeacher` incluem apenas recipients com `provider=PLATFORM` na contagem, evitando inflar números com registros de WhatsApp.

### 2.5 Visão do responsável

- Card mostra badge "Novo" (vermelho, pulsante) para atividades não lidas
- Após abrir, badge some e card mostra "Visualizado" (azul, ícone olho)
- **Responsáveis NÃO veem** o painel de tracking de outros responsáveis
  - A API `GET /api/activities/[id]` retorna `recipients: []` quando o user é PARENT

### 2.6 Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| PATCH | `/api/parents/activities/[id]/read` | PARENT | Marca como visualizado |
| GET | `/api/activities/[id]` | STAFF, PARENT | Detalhe (recipients omitidos para PARENT) |

---

## 3. Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| Tracking é PLATFORM-only | readAt e confirmedAt são sobre visualização na plataforma, não entrega WhatsApp |
| Visualização é automática | Zero fricção — basta abrir o item |
| Confirmação é opcional e por comunicado | Staff decide na criação se exige confirmação |
| Confirmação não existe para atividades | Apenas tracking de visualização |
| Pais não veem tracking de outros | Painel de rastreabilidade é exclusivo do staff |
| Contagens ignoram WhatsApp | Stats usam apenas recipients com provider=PLATFORM |
| sendToParents é true por padrão em atividades | Recipients PLATFORM são sempre criados, garantindo tracking |
| Operações são idempotentes | Re-marcar como lido/confirmado não causa erro |
| Optimistic updates | UI atualiza imediatamente, antes da resposta do server |

---

## 4. Arquitetura de Componentes

### Comunicados

```
CommunicationPage
  └─ AnnouncementsTab
       ├─ AnnouncementCard (card na lista)
       │    └─ Staff: "X visualizaram / X confirmaram"
       │    └─ Parent: "Visualizado" ou "Confirmado"
       │
       ├─ AnnouncementRecipientsPanel (staff, ao clicar no card)
       │    └─ Conteúdo + stats + lista de destinatários com status
       │
       └─ AnnouncementReplyPanel (parent, ao clicar no card)
            └─ Botão "Confirmar leitura" (se requiresConfirmation)
            └─ Feedback "Confirmado em..." (se já confirmou)
```

### Atividades

```
ActivitiesPage (staff) / ParentActivitiesPage (parent)
  └─ ActivityCard
  │    └─ Staff: "X/Y visualizaram"
  │    └─ Parent: "Novo" badge ou "Visualizado"
  │
  └─ ActivityDetailModal (drawer)
       └─ Staff: progress bar + lista de destinatários
       └─ Parent: apenas conteúdo (recipients omitidos pela API)

ParentCalendarPage / CalendarPage (staff)
  └─ CalendarGrid
       └─ Clique em atividade → auto mark-read (parent) + abre modal
```

### Hook central (comunicados)

```
useCommunication
  ├─ handleSelectAnnouncement(item)
  │    └─ Parent: auto markRead se unread
  │    └─ Staff: fetch recipient details
  │
  ├─ handleConfirm(announcementId)
  │    └─ PATCH /confirm + optimistic update
  │
  └─ States: recipientDetails, isLoadingRecipients, isConfirming
```
