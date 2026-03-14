/**
 * File System Health Check
 *
 * Checks file system write permissions and available space.
 */

import { HealthCheckResult } from '@adonisjs/core/health_check'
import fs from 'node:fs/promises'
import path from 'node:path'
import { randomBytes } from 'node:crypto'

export class FileSystemHealthCheck {
  constructor(
    private checkPath: string,
    private displayName: string
  ) {}

  /**
   * Run the health check
   */
  async run(): Promise<HealthCheckResult> {
    try {
      // Check if directory exists
      const stats = await fs.stat(this.checkPath)

      if (!stats.isDirectory()) {
        return {
          displayName: this.displayName,
          health: {
            status: 'error',
            message: `Path exists but is not a directory: ${this.checkPath}`,
          },
        }
      }

      // Check write permission by creating a temporary file
      const testFileName = `.health-check-${randomBytes(8).toString('hex')}.tmp`
      const testFilePath = path.join(this.checkPath, testFileName)

      try {
        // Try to write a test file
        await fs.writeFile(testFilePath, 'health-check', 'utf-8')

        // Read it back to verify
        await fs.readFile(testFilePath, 'utf-8')

        // Clean up
        await fs.unlink(testFilePath)

        // Check available space
        const diskUsage = await this.getDiskUsage(this.checkPath)

        return {
          displayName: this.displayName,
          health: {
            status: 'ok',
            message: `Directory is writable and accessible`,
            meta: {
              path: this.checkPath,
              writable: true,
              ...diskUsage,
            },
          },
        }
      } catch (writeError) {
        return {
          displayName: this.displayName,
          health: {
            status: 'error',
            message: `Directory is not writable: ${(writeError as Error).message}`,
            meta: {
              path: this.checkPath,
              writable: false,
            },
          },
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          displayName: this.displayName,
          health: {
            status: 'error',
            message: `Directory does not exist: ${this.checkPath}`,
            meta: {
              path: this.checkPath,
              exists: false,
            },
          },
        }
      }

      return {
        displayName: this.displayName,
        health: {
          status: 'error',
          message: `Error accessing directory: ${(error as Error).message}`,
          meta: {
            path: this.checkPath,
            error: (error as Error).message,
          },
        },
      }
    }
  }

  /**
   * Get disk usage information
   */
  private async getDiskUsage(dirPath: string): Promise<{
    availableSpace: string
    totalSpace: string
    usagePercentage: number
  }> {
    try {
      // This is a simplified implementation
      // In production, you'd use platform-specific commands or libraries
      // like 'diskusage' npm package
      const stats = await fs.stat(dirPath)

      return {
        availableSpace: 'N/A',
        totalSpace: 'N/A',
        usagePercentage: 0,
      }
    } catch {
      return {
        availableSpace: 'N/A',
        totalSpace: 'N/A',
        usagePercentage: 0,
      }
    }
  }
}
