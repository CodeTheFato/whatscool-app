# Regras de Negócio

## Regras Transversais

### Multi-tenant
- **Toda query é scoped por `schoolId`** — sem exceções
- `requireAuth()` retorna `user.schoolId` do JWT
- Services recebem `schoolId` como parâmetro obrigatório
- Um User pertence a exatamente uma School (FK obrigatória)
- Não existe acesso cross-school

### Autenticação
- Provider: Credentials (email + senha)
- Strategy: JWT (30 dias de expiração)
- Email é unique por escola (`@@unique([email, schoolId])`)
- Conta criada com `isActive: false` e `password: ""`
- Só contas `isActive: true` conseguem fazer login
- Token de ativação expira em 48 horas
- Senha mínima: 6 caracteres

### Permissões por Role

| Ação | ADMIN | SECRETARY | TEACHER | PARENT |
|------|-------|-----------|---------|--------|
| CRUD Alunos | ✅ | ✅ | ❌ | ❌ |
| CRUD Professores | ✅ | ✅ | ❌ | ❌ |
| CRUD Turmas | ✅ | ✅ | ❌ | ❌ |
| Gestão de Usuários | ✅ | ✅ | ❌ | ❌ |
| Criar Comunicados | ✅ | ✅ | ✅ | ❌ |
| Ver Comunicados (staff) | ✅ | ✅ | ✅ | — |
| Ver Comunicados (próprios) | — | — | — | ✅ |
| Criar Conversa Direta | ✅ | ✅ | ✅ | ❌ |
| Responder Comunicado | ❌ | ❌ | ❌ | ✅ |
| Enviar Mensagem Chat | ✅ | ✅ | ✅ | ✅ |
| Fechar/Reabrir Conversa | ✅ | ✅ | ✅ | ❌ |
| Listar Turmas/Disciplinas | ✅ | ✅ | ✅ | ❌ |
| Ver Dashboard | ✅ | ✅ | ✅ | ✅ |

---

## Regras por Domínio

### Alunos

| Regra | Implementação |
|-------|--------------|
| Matrícula única por escola | `@@unique([schoolId, registrationId])` |
| Mínimo 1 responsável por aluno | Form exige `guardian1` (validação client-side) |
| Máximo 2 responsáveis por aluno | Form permite `guardian1` + `guardian2` |
| Email do responsável reutilizável | Se já existe User PARENT com mesmo email na escola, reutiliza |
| Primeiro responsável é primary | `isPrimary: true` no `StudentParent` do guardian1 |
| Responsável orphan é deletado | Se parent perde todos os StudentParent links, User + Parent são deletados |
| Criação é transação atômica | Cria User + Student + Parent + StudentParent em `$transaction` |
| Status de aluno | ACTIVE → INACTIVE / TRANSFERRED / GRADUATED |

### Professores

| Regra | Implementação |
|-------|--------------|
| Email único por escola | Verificação no service antes de criar/atualizar |
| CPF único por escola | `@@unique([schoolId, cpf])` + verificação no service |
| Matrícula única por escola | `@@unique([schoolId, registrationId])` |
| Matrícula auto-gerada | `PROF-${Date.now().toString(36).toUpperCase()}` se não informada |
| Masks removidas antes de salvar | `unmask()` remove pontuação de CPF e telefone |
| Assignments são full replacement | Update deleta todos ClassTeacher e recria |
| Turmas/disciplinas validadas | Assignments referenciando IDs inexistentes lançam 404 |

### Turmas

| Regra | Implementação |
|-------|--------------|
| Nome único por ano letivo por escola | `@@unique([schoolId, name, academicYearId])` |
| AcademicYear auto-criado | ClassService faz find-or-create do AcademicYear |
| Disciplina única por escola | `@@unique([schoolId, name])` |
| Capacidade mínima 1 aluno | Validação Zod: `maxStudents.min(1)` |
| Aluno em uma turma por vez | `Student.classId` é FK singular (não M:N) |

### Comunicação

| Regra | Implementação |
|-------|--------------|
| Destinatários = responsáveis dos alunos | Comunicados CLASS/STUDENT resolvem parents via `studentParents` |
| Só responsáveis ativos recebem | Filtro `isActive: true` na resolução |
| Sem responsáveis = erro 422 | "Nenhum responsável encontrado" |
| Reply lazy-creates conversation | Conversa criada no primeiro reply, não no envio |
| 1 thread por responsável por comunicado | `@@unique([announcementId, parentUserId])` |
| Conversa fechada bloqueia mensagens | `status=CLOSED` → 400 em sendMessage |
| Só staff altera status de conversa | Role check: ADMIN/SECRETARY/TEACHER |
| Parent não cria conversas | Só pode responder comunicados ou participar de conversas criadas por staff |
| Dual tracking de entrega | WhatsApp ativado → 2 AnnouncementRecipients (PLATFORM + WHATSAPP) |
| Visualização automática | Abrir comunicado marca readAt automaticamente (zero fricção) |
| Confirmação opcional | Staff pode exigir confirmação manual por comunicado (requiresConfirmation) |
| Tracking é PLATFORM-only | Stats de visualização/confirmação contam apenas provider=PLATFORM |
| Pais não veem tracking de outros | Painel de rastreabilidade é exclusivo do staff |
| Atividades sempre criam recipients | sendToParents=true por padrão, garantindo tracking de visualização |
| SQS best-effort | Falha no SQS não impede criação na plataforma |
| Polling a cada 5 segundos | Frontend faz GET /poll com lastMessageId |

### Escolas

| Regra | Implementação |
|-------|--------------|
| CNPJ único no sistema | `@@unique` global em School.cnpj |
| Delete protegido | Não deleta escola com alunos, professores ou turmas |
| Timezone padrão | "America/Sao_Paulo" |

---

## Constraints de Banco de Dados

### Unique Constraints

| Tabela | Campos | Propósito |
|--------|--------|-----------|
| users | (email, school_id) | Email único por escola |
| students | (school_id, registration_id) | Matrícula única |
| teachers | (school_id, registration_id) | Matrícula única |
| teachers | (school_id, cpf) | CPF único |
| classes | (school_id, name, academic_year_id) | Nome único por ano |
| subjects | (school_id, name) | Nome único |
| academic_years | (school_id, year) | Ano único |
| class_teachers | (class_id, teacher_id, subject_id) | Vínculo único |
| student_parents | (student_id, parent_id) | Relação única |
| schedules | (class_id, day_of_week, start_time) | Sem conflito |
| announcement_recipients | (announcement_id, user_id, provider) | Um por provedor |
| conversations | (announcement_id, parent_user_id) | 1 thread por responsável por comunicado |
| conversation_participants | (conversation_id, user_id) | Participação única |
| attendances | (student_id, class_id, subject_id, date) | 1 chamada por dia |

### Cascade Rules

| Relação | onDelete | Motivo |
|---------|----------|--------|
| User → School | Cascade | Deletar escola deleta todos os users |
| Student → User | Cascade | Deletar user deleta student |
| Teacher → User | Cascade | Deletar user deleta teacher |
| Parent → User | Cascade | Deletar user deleta parent |
| StudentParent → Student/Parent | Cascade | Deletar aluno/parent limpa vínculo |
| ClassTeacher → Class/Teacher | Cascade | Deletar turma/professor limpa vínculos |
| Announcement → Class/Student | SetNull | Deletar turma/aluno mantém comunicado |
| Conversation → Announcement | SetNull | Deletar comunicado mantém conversa |
| ConversationMessage → Conversation | Cascade | Deletar conversa deleta mensagens |

---

## Invariantes Críticos

> Regras que **NUNCA devem ser quebradas:**

1. **Todo query usa `schoolId`** — isolamento multi-tenant é inviolável
2. **Modelo de comunicação intacto** — Announcements + Conversations + lazy reply
3. **Arquitetura assíncrona WhatsApp** — SQS → Lambda → WhatsApp Cloud API
4. **ClassTeacher junction** — vínculo professor-turma-disciplina com roles
5. **StudentParent junction** — vínculo aluno-responsável com metadados (kinship, isPrimary)
6. **JWT como fonte de schoolId** — nunca aceitar schoolId via query param ou body
