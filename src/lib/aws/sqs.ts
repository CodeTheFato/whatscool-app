import {
  SQSClient,
  SendMessageBatchCommand,
  type SendMessageBatchRequestEntry,
} from "@aws-sdk/client-sqs"

// ==================== SINGLETON ====================
let _client: SQSClient | null = null

export function getSqsClient(): SQSClient {
  if (!_client) {
    _client = new SQSClient({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }
  return _client
}

// ==================== TYPES ====================
export interface WhatsappJob {
  version: number
  type: string
  announcementId: string
  schoolId: string
  createdById: string
  recipientUserId: string
  audienceType: string
  classId: string | null
  studentId: string | null
  category: string
  title: string | null
  content: string
  allowReplies: boolean
  notifyViaWhatsapp: true
  createdAt: string
}

export interface BatchResult {
  total: number
  success: number
  failed: number
}

// ==================== BATCH SENDER ====================

/** Divide array em chunks de tamanho `size` */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0;i < arr.length;i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * Envia jobs para SQS em batches de 10 (limite AWS).
 * Suporta filas standard e FIFO automaticamente.
 */
export async function sendWhatsappJobsBatch(
  queueUrl: string,
  jobs: WhatsappJob[]
): Promise<BatchResult> {
  if (jobs.length === 0) return { total: 0, success: 0, failed: 0 }

  const client = getSqsClient()
  const isFifo = queueUrl.endsWith(".fifo")
  const batches = chunk(jobs, 10)

  let success = 0
  let failed = 0

  for (const batch of batches) {
    const entries: SendMessageBatchRequestEntry[] = batch.map((job, idx) => {
      const entry: SendMessageBatchRequestEntry = {
        Id: `msg-${idx}`,
        MessageBody: JSON.stringify(job),
      }

      if (isFifo) {
        entry.MessageGroupId = job.announcementId
        entry.MessageDeduplicationId = `${job.announcementId}:${job.recipientUserId}`
      }

      return entry
    })

    const command = new SendMessageBatchCommand({
      QueueUrl: queueUrl,
      Entries: entries,
    })

    const response = await client.send(command)

    success += response.Successful?.length ?? 0
    failed += response.Failed?.length ?? 0

    if (response.Failed && response.Failed.length > 0) {
      console.error("[SQS] Failed entries:", JSON.stringify(response.Failed))
    }
  }

  return { total: jobs.length, success, failed }
}
