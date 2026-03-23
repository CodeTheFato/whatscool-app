export async function sendWhatsAppHelloWorld({ to, schoolName, message }) {
  const token = assertEnv("WHATSAPP_TOKEN")
  const phoneNumberId = assertEnv("WHATSAPP_PHONE_NUMBER_ID")
  const template = assertEnv("WHATSAPP_TEMPLATE_MESSAGE")
  console.log("TEMPLATE: ", template)
  const version = process.env.WHATSAPP_GRAPH_VERSION ?? "v25.0"

  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              parameter_name: "school_name",
              text: schoolName,
            },
            {
              type: "text",
              parameter_name: "message",
              text: message,
            },
          ],
        },
      ],
    },
  }

  const maxAttempts = 3
  let lastErr

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      const text = await res.text()
      const data = text ? safeJsonParse(text) : null

      if (!res.ok) {
        const errMsg = data?.error?.message || `WhatsApp API error (${res.status})`

        console.error("[WHATSAPP] API error", {
          attempt,
          status: res.status,
          errMsg,
          fbtrace_id: data?.error?.fbtrace_id,
          errorCode: data?.error?.code,
          errorSubcode: data?.error?.error_subcode,
          response: data,
          requestBody: body,
        })

        if (isRetryableStatus(res.status) && attempt < maxAttempts) {
          await sleep(500 * attempt)
          continue
        }

        throw new Error(errMsg)
      }

      console.log("[WHATSAPP] Accepted", {
        attempt,
        messageId: data?.messages?.[0]?.id,
        to,
        template,
      })

      return data
    } catch (err) {
      lastErr = err
      const msg =
        err?.name === "AbortError"
          ? "Timeout calling WhatsApp API"
          : (err?.message ?? String(err))

      console.error("[WHATSAPP] Send failed", {
        attempt,
        msg,
        to,
        template,
      })

      if (attempt < maxAttempts) {
        await sleep(500 * attempt)
        continue
      }

      throw err
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastErr ?? new Error("Unknown WhatsApp send error")
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const assertEnv = (name) => {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

const safeJsonParse = (text) => {
  try { return JSON.parse(text) } catch { return { raw: text } }
}

const isRetryableStatus = (status) => status === 429 || (status >= 500 && status <= 599)
