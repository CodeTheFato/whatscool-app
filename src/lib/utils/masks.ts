/**
 * Input mask utilities for Brazilian document formats.
 * These are pure functions — they format a string value, not DOM events.
 */

/** Applies BR phone mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/** Applies CPF mask: 000.000.000-00 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/** Strips all non-digit characters */
export function unmask(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Normalizes phone to international format (E.164) for WhatsApp
 * Adds Brazil country code (55) if not present
 * @example
 * normalizePhoneToInternational("(11) 99999-9999") // "5511999999999"
 * normalizePhoneToInternational("11999999999") // "5511999999999"
 * normalizePhoneToInternational("5511999999999") // "5511999999999"
 */
export function normalizePhoneToInternational(value: string): string {
  const digits = value.replace(/\D/g, "")

  // If already has country code (starts with 55 and has 12-13 digits total)
  if (digits.startsWith("55") && digits.length >= 12 && digits.length <= 13) {
    return digits
  }

  // Add Brazil country code (55)
  return `55${digits}`
}
