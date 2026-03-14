import { DateTime } from 'luxon'
import Application from '@adonisjs/core/app'

interface UploadRateLimitConfig {
  maxUploadsPerHour?: number
  maxUploadsPerDay?: number
  maxUploadsPerWeek?: number
}

interface UploadQuota {
  userId?: string
  ipAddress: string
  uploadsLastHour: number
  uploadsLastDay: number
  uploadsLastWeek: number
  hourlyLimit: number
  dailyLimit: number
  weeklyLimit: number
  resetAt: {
    hourly?: DateTime
    daily?: DateTime
    weekly?: DateTime
  }
}

interface UploadAttemptRecord {
  id: string
  ipAddress: string
  userId?: string
  fileName: string
  fileSize: number
  mimeType: string
  status: 'pending' | 'approved' | 'rejected' | 'quarantined'
  threatFound?: boolean
  threatName?: string
  scannedAt?: DateTime
  createdAt: DateTime
}

export default class UploadSecurityService {
  protected uploadLimits: Map<string, UploadQuota> = new Map()
  protected uploadAttempts: UploadAttemptRecord[] = []

  constructor(protected app: Application) {}

  /**
   * Default rate limit configuration
   */
  private getDefaultLimits(): UploadRateLimitConfig {
    return {
      maxUploadsPerHour: 100,
      maxUploadsPerDay: 500,
      maxUploadsPerWeek: 2000,
    }
  }

  /**
   * Check upload rate limit
   */
  async checkRateLimit(
    ipAddress: string,
    userId?: string,
    config?: UploadRateLimitConfig
  ): Promise<{
    allowed: boolean
    remainingUploads: number
    resetAt?: DateTime
    reason?: string
  }> {
    const limits = { ...this.getDefaultLimits(), ...config }

    // Get or create quota
    const quotaKey = userId ? `user:${userId}` : `ip:${ipAddress}`
    let quota = this.uploadLimits.get(quotaKey)

    const now = DateTime.now()

    if (!quota) {
      quota = {
        ipAddress,
        userId,
        uploadsLastHour: 0,
        uploadsLastDay: 0,
        uploadsLastWeek: 0,
        hourlyLimit: limits.maxUploadsPerHour || 100,
        dailyLimit: limits.maxUploadsPerDay || 500,
        weeklyLimit: limits.maxUploadsPerWeek || 2000,
        resetAt: {
          hourly: now.plus({ hours: 1 }),
          daily: now.endOf('day'),
          weekly: now.plus({ weeks: 1 }),
        },
      }

      this.uploadLimits.set(quotaKey, quota)
    }

    // Check and reset quotas based on time
    if (quota.resetAt.hourly && now >= quota.resetAt.hourly) {
      quota.uploadsLastHour = 0
      quota.resetAt.hourly = now.plus({ hours: 1 })
    }

    if (quota.resetAt.daily && now >= quota.resetAt.daily) {
      quota.uploadsLastDay = 0
      quota.resetAt.daily = now.endOf('day')
    }

    if (quota.resetAt.weekly && now >= quota.resetAt.weekly) {
      quota.uploadsLastWeek = 0
      quota.resetAt.weekly = now.plus({ weeks: 1 })
    }

    // Check limits
    if (quota.uploadsLastHour >= quota.hourlyLimit) {
      return {
        allowed: false,
        remainingUploads: 0,
        resetAt: quota.resetAt.hourly,
        reason: 'Hourly upload limit exceeded',
      }
    }

    if (quota.uploadsLastDay >= quota.dailyLimit) {
      return {
        allowed: false,
        remainingUploads: 0,
        resetAt: quota.resetAt.daily,
        reason: 'Daily upload limit exceeded',
      }
    }

    if (quota.uploadsLastWeek >= quota.weeklyLimit) {
      return {
        allowed: false,
        remainingUploads: 0,
        resetAt: quota.resetAt.weekly,
        reason: 'Weekly upload limit exceeded',
      }
    }

    // Calculate remaining uploads (minimum of all limits)
    const remainingHourly = quota.hourlyLimit - quota.uploadsLastHour
    const remainingDaily = quota.dailyLimit - quota.uploadsLastDay
    const remainingWeekly = quota.weeklyLimit - quota.uploadsLastWeek

    return {
      allowed: true,
      remainingUploads: Math.min(remainingHourly, remainingDaily, remainingWeekly),
      resetAt: quota.resetAt.hourly, // Next reset
    }
  }

  /**
   * Increment upload count
   */
  async incrementUploadCount(ipAddress: string, userId?: string): Promise<void> {
    const quotaKey = userId ? `user:${userId}` : `ip:${ipAddress}`
    const quota = this.uploadLimits.get(quotaKey)

    if (quota) {
      quota.uploadsLastHour++
      quota.uploadsLastDay++
      quota.uploadsLastWeek++
    }
  }

  /**
   * Record upload attempt
   */
  async recordUploadAttempt(data: {
    ipAddress: string
    fileName: string
    fileSize: number
    mimeType: string
    userId?: string
    status?: 'pending' | 'approved' | 'rejected' | 'quarantined'
    threatFound?: boolean
    threatName?: string
  }): Promise<UploadAttemptRecord> {
    const attempt: UploadAttemptRecord = {
      id = Math.random().toString(36).substring(2),
      ipAddress = data.ipAddress,
      userId = data.userId,
      fileName = data.fileName,
      fileSize = data.fileSize,
      mimeType = data.mimeType,
      status = data.status || 'pending',
      threatFound = data.threatFound,
      threatName = data.threatName,
      createdAt = DateTime.now(),
    }

    this.uploadAttempts.push(attempt)

    // Keep only last 10000 attempts
    if (this.uploadAttempts.length > 10000) {
      this.uploadAttempts = this.uploadAttempts.slice(-10000)
    }

    return attempt
  }

  /**
   * Get upload attempts by IP
   */
  async getUploadAttemptsByIP(
    ipAddress: string,
    limit: number = 100
  ): Promise<UploadAttemptRecord[]> {
    return this.uploadAttempts
      .filter((attempt) => attempt.ipAddress === ipAddress)
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limit)
  }

  /**
   * Get upload attempts by user
   */
  async getUploadAttemptsByUser(
    userId: string,
    limit: number = 100
  ): Promise<UploadAttemptRecord[]> {
    return this.uploadAttempts
      .filter((attempt) => attempt.userId === userId)
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limit)
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(): Promise<{
    totalAttempts: number
    rejectedAttempts: number
    quarantinedAttempts: number
    threatsFound: number
    topOffenders: string[]
    recentAttempts: UploadAttemptRecord[]
  }> {
    const totalAttempts = this.uploadAttempts.length
    const rejectedAttempts = this.uploadAttempts.filter((a) => a.status === 'rejected').length
    const quarantinedAttempts = this.uploadAttempts.filter((a) => a.status === 'quarantined').length
    const threatsFound = this.uploadAttempts.filter((a) => a.threatFound).length

    // Get top offenders (IPs with most rejected uploads)
    const ipCounts = new Map<string, number>()
    this.uploadAttempts
      .filter((a) => a.status === 'rejected')
      .forEach((attempt) => {
        const count = ipCounts.get(attempt.ipAddress) || 0
        ipCounts.set(attempt.ipAddress, count + 1)
      })

    const topOffenders = Array.from(ipCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip]) => ip)

    // Get recent attempts (last 100)
    const recentAttempts = this.uploadAttempts
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, 100)

    return {
      totalAttempts,
      rejectedAttempts,
      quarantinedAttempts,
      threatsFound,
      topOffenders,
      recentAttempts,
    }
  }

  /**
   * Check if IP is blocked
   */
  async isIPBlocked(ipAddress: string): Promise<boolean> {
    const recentAttempts = await this.getUploadAttemptsByIP(ipAddress, 10)
    const rejectedCount = recentAttempts.filter((a) => a.status === 'rejected').length

    // Block IP if 5+ rejections in last 10 attempts
    return rejectedCount >= 5
  }

  /**
   * Get upload statistics for user
   */
  async getUserUploadStats(userId: string): Promise<{
    uploadsThisHour: number
    uploadsToday: number
    uploadsThisWeek: number
    totalUploads: number
  }> {
    const userAttempts = await this.getUploadAttemptsByUser(userId, 1000)
    const now = DateTime.now()

    const oneHourAgo = now.minus({ hours: 1 })
    const oneDayAgo = now.minus({ days: 1 })
    const oneWeekAgo = now.minus({ weeks: 1 })

    return {
      uploadsThisHour: userAttempts.filter((a) => a.createdAt > oneHourAgo).length,
      uploadsToday: userAttempts.filter((a) => a.createdAt > oneDayAgo).length,
      uploadsThisWeek: userAttempts.filter((a) => a.createdAt > oneWeekAgo).length,
      totalUploads: userAttempts.length,
    }
  }

  /**
   * Clear old upload attempts (older than 30 days)
   */
  async clearOldAttempts(): Promise<number> {
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 })
    const beforeLength = this.uploadAttempts.length

    this.uploadAttempts = this.uploadAttempts.filter(
      (attempt) => attempt.createdAt > thirtyDaysAgo
    )

    const cleared = beforeLength - this.uploadAttempts.length
    return cleared
  }

  /**
   * Get admin dashboard data
   */
  async getAdminDashboardData(): Promise<{
    stats: any
    recentAttempts: UploadAttemptRecord[]
    topIPs: Array<{ ip: string; uploads: number; rejections: number }>
  }> {
    const stats = await this.getSecurityStats()

    // Get top IPs by upload volume
    const ipCounts = new Map<string, { uploads: number; rejections: number }>()

    for (const attempt of this.uploadAttempts) {
      const existing = ipCounts.get(attempt.ipAddress) || { uploads: 0, rejections: 0 }
      existing.uploads++
      if (attempt.status === 'rejected') existing.rejections++
      ipCounts.set(attempt.ipAddress, existing)
    }

    const topIPs = Array.from(ipCounts.entries())
      .sort(([, a], [, b]) => b.uploads - a.uploads)
      .slice(0, 20)
      .map(([ip, data]) => ({ ip, uploads: data.uploads, rejections: data.rejections }))

    return {
      stats,
      recentAttempts: stats.recentAttempts.slice(0, 50),
      topIPs,
    }
  }
}
