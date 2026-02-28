import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'

export interface ProcessImportData {
  importId: string
  filePath: string
  type: 'products' | 'customers' | 'orders'
  columnMapping: Record<string, string>
  storeId: string
  userId: string
}

/**
 * Process Import Job
 *
 * Handles CSV/Excel file imports in the background.
 * Queue: imports
 */
export async function handleProcessImport(job: JobContext): Promise<void> {
  const payload = job.data as ProcessImportData

  logger.debug(`[ImportJob] Processing ${payload.type} import: ${payload.importId}`)

  try {
    await job.updateProgress(5)

    const ImportExportService = (await import('#services/import_export_service')).default
    const service = new ImportExportService()

    // Read and parse CSV file
    const fs = await import('node:fs/promises')
    const content = await fs.readFile(payload.filePath, 'utf-8')
    const lines = content.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim())
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || '' })
      return row
    })

    switch (payload.type) {
      case 'products':
        await service.importProducts(payload.storeId, rows)
        break
      case 'customers':
        await service.importCustomers(payload.storeId, rows)
        break
      default:
        throw new Error(`Unsupported import type: ${payload.type}`)
    }

    await job.updateProgress(100)
    logger.info(`[ImportJob] Import ${payload.importId} completed`)
  } catch (error: unknown) {
    logger.error(`[ImportJob] Import ${payload.importId} failed: ${(error as Error).message}`)
    throw error
  }
}
