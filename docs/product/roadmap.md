# Roadmap — Após MVP

## MVP Atual (em desenvolvimento)

### Implementado
- CRUD completo de alunos, professores, turmas, disciplinas
- Sistema de comunicados (Announcements) com entrega PLATFORM + WhatsApp
- Chat interno (Conversations) entre staff e responsáveis
- Reply de comunicados (lazy conversation creation)
- Onboarding multi-step para novas escolas
- Import bulk via CSV (alunos, professores)
- Dashboard por role (admin, secretary, teacher, parent)
- Ativação de conta por token

### Em validação
- Integração WhatsApp via SQS + Lambda (fluxo assíncrono)
- Delivery tracking (PENDING → SENT → DELIVERED → READ)

---

## Fase 2 — Pós-validação com escolas

### Frequência (Attendance)
- Chamada digital por turma/disciplina
- Professor marca presença pelo app
- Responsável notificado de faltas
- Schema já existe: `Attendance` model com status (PRESENT, ABSENT, LATE, EXCUSED)

### Atividades (Activities)
- Professor cria atividades com prazo
- Aluno visualiza e entrega (quando houver portal do aluno)
- Schema existe: `Activity` model (sem submissions por enquanto)

### Horários (Schedule)
- Grade de horários por turma
- Visualização semanal
- Schema existe: `Schedule` model com `dayOfWeek` + `startTime`/`endTime` em minutos

---

## Fase 3 — Gestão Escolar

### Notas e Boletins
- Lançamento de notas por período (AcademicPeriod)
- Boletim digital para responsáveis
- Schema a ser criado: `Grade` model + `AcademicPeriod`
- `AcademicYear` já existe

### Autorizações
- Passeios, medicamentos, uso de imagem
- Aprovação digital pelo responsável
- Schema existe: `Authorization` model

### Portal do Aluno
- Acesso próprio do aluno (role STUDENT)
- Visualização de notas, atividades, horários
- Páginas foram removidas do MVP, serão recriadas

---

## Fase 4 — Monetização e Escala

### Financeiro
- Geração e acompanhamento de boletos
- Notificação de inadimplência via WhatsApp
- Schema removido do MVP, será recriado

### Relatórios
- Dashboard analítico para gestores
- Frequência por turma, inadimplência, engajamento
- Exportação PDF/Excel

### Multi-escola
- Admin gerencia múltiplas escolas
- Dashboard consolidado

---

## Decisões Técnicas Pendentes

| Decisão | Contexto |
|---------|----------|
| Soft delete | Adicionar `deletedAt` em modelos críticos (alunos, notas, financeiro) para compliance |
| Audit log | Rastreabilidade de alterações em notas e dados sensíveis |
| Real-time | Migrar polling (5s) para WebSocket/SSE no chat |
| File storage | S3 para anexos de atividades e documentos |
| Email transacional | Ativação de conta, notificações (hoje só log no console) |
