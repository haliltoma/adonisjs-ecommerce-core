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

    await service.processImport({
      importId: payload.importId,
      filePath: payload.filePath,
      type: payload.type,
      columnMapping: payload.columnMapping,
      storeId: payload.storeId,
      userId: payload.userId,
      onProgress: async (percent: number) => {
        await job.updateProgress(Math.min(95, percent))
      },
    })

    await job.updateProgress(100)
    logger.info(`[ImportJob] Import ${payload.importId} completed`)
  } catch (error) {
    logger.error(`[ImportJob] Import ${payload.importId} failed: ${(error as Error).message}`)
    throw error
  }
}
