# WhatSchool — Contexto do Projeto

> **Leia este arquivo primeiro.** Ele serve como índice para toda a documentação do projeto.

## O que é

SaaS de comunicação escolar focado em resolver a fragmentação na comunicação entre escolas e responsáveis. O produto NÃO é um ERP escolar completo — o core é comunicação.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes + Service Layer, Prisma ORM
- **Banco:** PostgreSQL
- **Auth:** NextAuth (JWT, credentials provider)
- **Infra:** AWS SQS + Lambda para WhatsApp assíncrono
- **Integração:** WhatsApp Cloud API

## Documentação

### Produto
- [Visão do Produto](product/vision.md) — problema, solução, público-alvo, diferenciais
- [Escopo MVP](product/mvp.md) — funcionalidades incluídas/excluídas no MVP
- [Roadmap](product/roadmap.md) — próximos passos após MVP

### Arquitetura
- [Overview](architecture/overview.md) — camadas, stack, padrões de projeto
- [Camada de API](architecture/api-layer.md) — service layer, utilities, padrões de rota
- [Banco de Dados](architecture/database.md) — schema completo, tabelas, relações, indexes

### Domínio (Regras de Negócio)
- [Usuários e Auth](domain/users-auth.md) — roles, autenticação, ativação de conta
- [Escolas](domain/schools.md) — gestão multi-tenant
- [Alunos e Responsáveis](domain/students.md) — matrícula, responsáveis, StudentParent
- [Professores](domain/teachers.md) — cadastro, vínculos turma-disciplina
- [Turmas e Disciplinas](domain/classes.md) — turmas, ano letivo, grade, horários
- [Comunicação](domain/communication.md) — comunicados, conversas, WhatsApp, chat

### API
- [Referência de Endpoints](api/endpoints.md) — todos os endpoints com métodos, auth, payloads

### Regras de Negócio
- [Business Rules](business-rules.md) — regras transversais, constraints, validações

## Princípios do Projeto

1. **Simplicidade primeiro** — MVP funcional, sem sobreengenharia
2. **Comunicação é o core** — gestão escolar é suporte, não foco
3. **UX extremamente simples** — secretárias e responsáveis não são técnicos
4. **Multi-tenant desde o início** — cada escola tem seus dados isolados por `schoolId`
5. **Escalável por design** — service layer, filas assíncronas, schema normalizado

## Regras Importantes

- NUNCA quebrar o modelo de comunicação (Announcements + Conversations)
- NUNCA quebrar a arquitetura assíncrona (SQS + Lambda)
- NUNCA quebrar o modelo ClassTeacher (vínculo professor-turma-disciplina)
- Toda query deve ser scoped por `schoolId` (multi-tenant)
