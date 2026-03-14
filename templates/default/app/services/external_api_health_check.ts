/**
 * External API Health Check
 *
 * Checks the reachability and response time of external APIs.
 */

import { HealthCheckResult } from '@adonisjs/core/health_check'
import logger from '@adonisjs/core/services/logger'

export class ExternalAPIHealthCheck {
  private timeout: number

  constructor(
    private apiName: string,
    private url: string,
    timeout?: number
  ) {
    this.timeout = timeout || 5000
  }

  /**
   * Run the health check
   */
  async run(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(this.url, {
        method: 'GET',
        signal: controller.signal,
        // Don't follow redirects
        redirect: 'manual',
      })

      clearTimeout(timeoutId)

      const duration = Date.now() - startTime

      // Check response status
      if (response.status >= 500) {
        return {
          displayName: `External API: ${this.apiName}`,
          health: {
            status: 'error',
            message: `API returned error status: ${response.status}`,
            meta: {
              apiName: this.apiName,
              url: this.url,
              status: response.status,
              duration: `${duration}ms`,
            },
          },
        }
      }

      if (response.status >= 400) {
        return {
          displayName: `External API: ${this.apiName}`,
          health: {
            status: 'warning',
            message: `API returned warning status: ${response.status}`,
            meta: {
              apiName: this.apiName,
              url: this.url,
              status: response.status,
              duration: `${duration}ms`,
            },
          },
        }
      }

      return {
        displayName: `External API: ${this.apiName}`,
        health: {
          status: 'ok',
          message: `API is reachable and responding`,
          meta: {
            apiName: this.apiName,
            url: this.url,
            status: response.status,
            duration: `${duration}ms`,
          },
        },
      }
    } catch (error) {
      const duration = Date.now() - startTime

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          displayName: `External API: ${this.apiName}`,
          health: {
            status: 'error',
            message: `API request timeout after ${this.timeout}ms`,
            meta: {
              apiName: this.apiName,
              url: this.url,
              timeout: `${this.timeout}ms`,
              duration: `${duration}ms`,
            },
          },
        }
      }

      // Handle other errors
      logger.error({
        err: error,
        apiName: this.apiName,
        url: this.url,
      }, 'External API health check failed')

      return {
        displayName: `External API: ${this.apiName}`,
        health: {
          status: 'error',
          message: `API is unreachable: ${(error as Error).message}`,
          meta: {
            apiName: this.apiName,
            url: this.url,
            error: (error as Error).message,
            duration: `${duration}ms`,
          },
        },
      }
    }
  }
}
