# Escopo do MVP

## Objetivo

Validar o produto com 1–2 escolas reais, focando na dor principal: comunicação fragmentada entre escola e responsáveis.

---

## Funcionalidades Implementadas

### Comunicação (Core)

| Feature | Status | Descrição |
|---------|--------|-----------|
| Comunicados (Announcements) | ✅ Implementado | Staff cria e envia para turma ou aluno específico |
| Categorias de comunicado | ✅ Implementado | COMUNICADOS, BOLETOS, ATRASO_BOLETOS, AVISOS |
| Delivery tracking | ✅ Implementado | Status PENDING → SENT → DELIVERED → READ por destinatário |
| Entrega via plataforma | ✅ Implementado | AnnouncementRecipient com provider=PLATFORM |
| Entrega via WhatsApp | ✅ Implementado | SQS → Lambda → WhatsApp Cloud API (assíncrono) |
| Reply de comunicados | ✅ Implementado | Responsável responde, cria conversation (lazy) |
| Chat interno | ✅ Implementado | Conversas diretas entre staff e responsáveis |
| Polling de mensagens | ✅ Implementado | GET /poll a cada 5s com lastMessageId |
| Badges de unread | ✅ Implementado | Contagem no header (chat + announcements) |
| Mark as read | ✅ Implementado | Comunicados e conversas |
| Fechar/reabrir conversa | ✅ Implementado | Só staff pode alterar status |

### Gestão Escolar (Suporte à comunicação)

| Feature | Status | Descrição |
|---------|--------|-----------|
| CRUD Alunos | ✅ Implementado | Cadastro com 1-2 responsáveis, matrícula, turma |
| CRUD Professores | ✅ Implementado | Cadastro com vínculos turma-disciplina |
| CRUD Turmas | ✅ Implementado | Criação com auto-create AcademicYear |
| Disciplinas | ✅ Implementado | Listagem (criação via seed/admin) |
| Vínculos Professor-Turma-Disciplina | ✅ Implementado | ClassTeacher com roles MAIN/SUBJECT/ASSISTANT |
| StudentParent com metadados | ✅ Implementado | kinship, isPrimary, canPickup, isEmergency |

### Autenticação & Onboarding

| Feature | Status | Descrição |
|---------|--------|-----------|
| Login (Credentials) | ✅ Implementado | Email + senha, JWT 30 dias |
| Middleware role-based | ✅ Implementado | Protege /admin, /secretary, /teacher, /parents |
| Ativação de conta por token | ✅ Implementado | Token 48h, mock "123456" em dev |
| Onboarding multi-step | ✅ Implementado | Wizard: escola → admin → configuração |
| Reenvio de token | ✅ Implementado | Seguro (não revela se email existe) |

### Dashboards

| Feature | Status | Descrição |
|---------|--------|-----------|
| Dashboard Admin | ✅ Implementado | Stats + atividade recente |
| Dashboard Secretary | ✅ Implementado | Stats + quick actions |
| Dashboard Teacher | ✅ Implementado | Turmas + comunicados |
| Dashboard Parent | ✅ Implementado | Comunicados + conversas |

---

## Excluído do MVP

| Feature | Motivo | Plano |
|---------|--------|-------|
| Financeiro (boletos) | Não é core de comunicação | Fase 4 (monetização) |
| Notas e boletins | Complexidade alta, validação necessária | Fase 3 |
| Frequência digital | Schema pronto, sem API/UI | Fase 2 |
| Atividades | Schema pronto, sem API/UI | Fase 2 |
| Horários (Schedule) | Schema pronto, sem API/UI | Fase 2 |
| Autorizações | Schema pronto, sem API/UI | Fase 3 |
| Portal do Aluno | Páginas removidas | Fase 3 |
| Import CSV bulk | Parcialmente implementado | Pós-validação |
| Email transacional | Tokens logados no console | Pós-validação |
| Relatórios avançados | Sem demanda validada | Fase 4 |
| Permissões granulares | Role-based simples suficiente | Quando necessário |
| Audience ALL_SCHOOL | Comunicados só para CLASS/STUDENT | Quando necessário |
| WebSocket/SSE | Polling 5s suficiente para MVP | Quando performance exigir |

---

## Estratégia de Validação

1. **Construir MVP funcional** — foco em comunicação + gestão mínima
2. **Onboarding com 1-2 escolas** — setup assistido, coleta de feedback
3. **Iterar com base em uso real** — priorizar features pedidas pelas escolas
4. **Expandir gestão sob demanda** — frequência, notas, horários conforme feedback

---

## Schema Pronto vs Implementado

Modelos que existem no Prisma schema mas **não têm API, services ou pages** no MVP:

| Modelo | Schema | API | Service | Pages |
|--------|--------|-----|---------|-------|
| AcademicYear | ✅ | — | Auto-created via ClassService | — |
| Attendance | ✅ | ❌ | ❌ | ❌ |
| Activity | ✅ | ❌ | ❌ | ❌ |
| Schedule | ✅ | ❌ | ❌ | ❌ |
| Authorization | ✅ | ❌ | ❌ | ❌ |

Esses modelos estão migrados no banco, prontos para receber API e UI quando a feature for priorizada.
