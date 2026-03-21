# Architecture Overview

## Frontend

- Next.js (App Router)
- shadcn/ui
- Tailwind

Responsável por:
- UI
- formulários
- dashboards

---

## Backend

- Next.js API Routes
- Prisma ORM

Responsável por:
- regras de negócio
- persistência
- autenticação

---

## Comunicação assíncrona

Fluxo:

1. criação de comunicado
2. grava no banco
3. cria AnnouncementRecipients
4. se WhatsApp:
   → envia jobs para SQS
5. Lambda consome
6. Lambda chama WhatsApp API

---

## Infra

- AWS SQS → fila de mensagens
- AWS Lambda → worker
- WhatsApp Cloud API → envio real

---

## Banco

- PostgreSQL

---

## Princípios

- desacoplamento via fila
- evitar bloqueio na request principal
- idempotência no processamento
