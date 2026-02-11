import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'

export interface SendEmailData {
  to: string
  subject: string
  template: string
  data: Record<string, unknown>
  from?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
}

/**
 * Send Email Job
 *
 * Processes email sending via AdonisJS Mail.
 * Queue: emails
 */
export async function handleSendEmail(job: JobContext): Promise<void> {
  const payload = job.data as SendEmailData

  logger.debug(`[SendEmailJob] Sending email to ${payload.to}: ${payload.subject}`)

  try {
    await job.updateProgress(10)

    let mail: any
    try {
      // @ts-ignore - @adonisjs/mail is an optional dependency
      mail = (await import('@adonisjs/mail/services/main')).default
    } catch {
      logger.warn('[SendEmailJob] @adonisjs/mail not installed, skipping email')
      return
    }

    await mail.send((message: any) => {
      message
        .to(payload.to)
        .subject(payload.subject)
        .htmlView(`emails/${payload.template}`, payload.data)

      if (payload.from) message.from(payload.from)
      if (payload.replyTo) message.replyTo(payload.replyTo)
      if (payload.cc) payload.cc.forEach((addr) => message.cc(addr))
      if (payload.bcc) payload.bcc.forEach((addr) => message.bcc(addr))
    })

    await job.updateProgress(100)
    logger.info(`[SendEmailJob] Email sent to ${payload.to}`)
  } catch (error) {
    logger.error(`[SendEmailJob] Failed to send email to ${payload.to}: ${(error as Error).message}`)
    throw error
  }
}
