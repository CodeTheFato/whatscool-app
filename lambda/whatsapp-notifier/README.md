# WhatsApp Notifier Lambda

Lambda responsável por enviar notificações via WhatsApp para os responsáveis dos alunos. Consome mensagens de uma fila SQS e dispara via WhatsApp Business API (Meta Graph API).

## Arquitetura

```
Next.js App → SQS Queue → Lambda (esta) → WhatsApp Business API → Responsável
```

1. A aplicação (AnnouncementService / AgendaService) publica jobs na fila SQS
2. A Lambda é acionada automaticamente pelo trigger SQS
3. Para cada mensagem, envia uma notificação usando um template do WhatsApp
4. Mensagens com falha são retornadas para reprocessamento (partial batch failure)

## Tipos de notificação

| Tipo | Origem | Descrição |
|------|--------|-----------|
| `WHATSAPP_ANNOUNCEMENT` | Comunicação | Comunicados, boletos, avisos gerais |
| `WHATSAPP_ACTIVITY` | Agenda | Lições de casa e eventos escolares |

## Payload SQS esperado

```json
{
  "version": 1,
  "type": "WHATSAPP_ANNOUNCEMENT | WHATSAPP_ACTIVITY",
  "announcementId": "uuid",
  "schoolId": "uuid",
  "schoolName": "Nome da Escola",
  "createdById": "uuid",
  "recipientUserId": "uuid",
  "recipientPhone": "5511999999999",
  "audienceType": "CLASS | STUDENT",
  "classId": "uuid | null",
  "studentId": "uuid | null",
  "category": "COMUNICADOS | HOMEWORK | EVENT",
  "title": "Título",
  "content": "Conteúdo da mensagem",
  "allowReplies": false,
  "notifyViaWhatsapp": true,
  "createdAt": "2026-03-22T00:00:00.000Z"
}
```

## Variáveis de ambiente (configuradas na Lambda AWS)

| Variável | Descrição |
|----------|-----------|
| `WHATSAPP_TOKEN` | Token de acesso da WhatsApp Business API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número de telefone no Meta Business |
| `WHATSAPP_TEMPLATE_MESSAGE` | Nome do template aprovado no Meta (ex: `school_notification`) |
| `WHATSAPP_GRAPH_VERSION` | Versão da Graph API (default: `v25.0`) |
| `WHATSAPP_TEST_TO` | Número de fallback para testes (usado quando `recipientPhone` é null) |

## Template WhatsApp

Usa o template `school_notification` cadastrado no Meta Business Manager com dois parâmetros nomeados:

- `{{school_name}}` — Nome da escola
- `{{message}}` — Conteúdo da notificação

Para atividades (`WHATSAPP_ACTIVITY`), a mensagem é formatada como:
```
Licao de Casa - Título da atividade - Descrição da atividade
```

## Estrutura de arquivos

```
lambda/whatsapp-notifier/
  index.mjs                  ← Handler principal (processamento SQS)
  whatsappNotification.mjs   ← Envio WhatsApp (retry, timeout, error handling)
  deploy.sh                  ← Script de deploy via AWS CLI
  README.md                  ← Esta documentação
```

## Deploy

### Pré-requisitos

- AWS CLI instalada e configurada (`aws configure`)
- Usuário IAM com permissão `lambda:UpdateFunctionCode` na função `whatscool-whatsapp-dispatcher`

### Executar deploy

```bash
./lambda/whatsapp-notifier/deploy.sh
```

O script:
1. Zipa `index.mjs` e `whatsappNotification.mjs`
2. Faz upload via `aws lambda update-function-code`
3. Remove o zip após o deploy

### Configuração

O nome da função e região podem ser customizados:

```bash
LAMBDA_FUNCTION_NAME=outra-funcao AWS_REGION=sa-east-1 ./lambda/whatsapp-notifier/deploy.sh
```

Valores padrão:
- **Function name**: `whatscool-whatsapp-dispatcher`
- **Region**: `us-east-1`

## Tratamento de erros

- **Retry automático**: chamadas à API do WhatsApp têm até 3 tentativas com backoff (500ms, 1s, 1.5s)
- **Timeout**: cada chamada tem timeout de 10 segundos
- **Partial batch failure**: mensagens que falham são retornadas para a fila SQS reprocessar
- **notifyViaWhatsapp=false**: mensagem é ignorada silenciosamente (não é retentada)

## Infra AWS

| Recurso | Nome/ARN |
|---------|----------|
| Lambda | `whatscool-whatsapp-dispatcher` |
| Runtime | `nodejs24.x` (arm64) |
| Região | `us-east-1` |
| IAM Role | `whatscool-whatsapp-dispatcher-role-lv89wvfz` |
| SQS Queue | Configurada via `SQS_WHATSAPP_QUEUE_URL` no app Next.js |
