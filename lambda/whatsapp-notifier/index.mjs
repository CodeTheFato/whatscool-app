import { sendWhatsAppHelloWorld } from './whatsappNotification.mjs'

const KNOWN_TYPES = ["WHATSAPP_ANNOUNCEMENT", "WHATSAPP_ACTIVITY"]

const ACTIVITY_LABELS = {
  HOMEWORK: "Licao de Casa",
  EVENT: "Evento",
}

export const handler = async (event) => {
  const records = Array.isArray(event?.Records) ? event.Records : []

  console.log("[SQS] Received batch", {
    totalRecords: records.length,
    eventSource: records[0]?.eventSource,
    eventSourceARN: records[0]?.eventSourceARN,
    awsRegion: records[0]?.awsRegion,
  })

  const failures = []
  let successCount = 0

  for (const record of records) {
    const messageId = record?.messageId

    try {
      await processRecord(record)
      successCount++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)

      console.error("[SQS] Failed to process message", {
        messageId,
        error: message,
      })

      if (messageId) {
        failures.push({ itemIdentifier: messageId })
      } else {
        failures.push({ itemIdentifier: "unknown-message-id" })
      }
    }
  }

  console.log("[SQS] Batch processed", {
    successCount,
    failureCount: failures.length,
  })

  return {
    batchItemFailures: failures,
  }
}

async function processRecord(record) {
  const rawBody = record?.body

  if (!rawBody || typeof rawBody !== "string") {
    throw new Error("Missing or invalid record.body")
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw new Error("Invalid JSON in record.body")
  }

  const {
    type,
    announcementId,
    recipientUserId,
    content,
    notifyViaWhatsapp,
    recipientPhone,
    schoolName,
    category,
    title,
  } = payload ?? {}

  const entityId = announcementId

  // Validações mínimas
  if (!type || typeof type !== "string") throw new Error("payload.type is required")
  if (!entityId || typeof entityId !== "string") throw new Error("payload.announcementId is required")
  if (!recipientUserId || typeof recipientUserId !== "string") throw new Error("payload.recipientUserId is required")
  if (!content || typeof content !== "string" || !content.trim()) throw new Error("payload.content is required")

  // Se notifyViaWhatsapp for false, ignora
  if (!notifyViaWhatsapp) {
    console.log("[SQS] notifyViaWhatsapp=false -> skipping", {
      entityId,
      recipientUserId,
    })
    return
  }

  // Validar tipo conhecido
  if (!KNOWN_TYPES.includes(type)) {
    throw new Error(`Unknown payload.type: ${type}`)
  }

  const to = recipientPhone ?? process.env.WHATSAPP_TEST_TO
  const safeName = schoolName || "Escola"

  console.log("[SQS] Processing", { type, entityId, recipientUserId, to, schoolName: safeName })

  // Montar mensagem de acordo com o tipo
  const message = type === "WHATSAPP_ACTIVITY"
    ? buildActivityMessage({ category, title, content })
    : content

  await sendWhatsAppHelloWorld({ to, schoolName: safeName, message })
}

function buildActivityMessage({ category, title, content }) {
  const label = ACTIVITY_LABELS[category] || "Atividade"
  return `${label} - ${title || "Nova atividade"} - ${content}`
}
