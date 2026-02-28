/**
 * QueryOptimizer
 *
 * Provides pagination, cursor-based fetching, and query scope helpers
 * for optimized database operations across the commerce platform.
 */

import { BaseModel } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Apply efficient pagination to a query
 */
export async function paginate<T extends typeof BaseModel>(
  query: ModelQueryBuilderContract<T>,
  page: number = 1,
  perPage: number = 25
): Promise<PaginatedResult<InstanceType<T>>> {
  const clonedQuery = query.clone()
  const countResult = await clonedQuery.count('* as total').first()
  const total = Number(countResult?.$extras?.total || 0)

  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(Math.max(1, page), lastPage)

  const data = await query
    .limit(perPage)
    .offset((currentPage - 1) * perPage)

  return {
    data: data as InstanceType<T>[],
    meta: {
      total,
      perPage,
      currentPage,
      lastPage,
      firstPage: 1,
      hasNext: currentPage < lastPage,
      hasPrevious: currentPage > 1,
    },
  }
}

/**
 * Apply cursor-based pagination (more efficient for large datasets)
 */
export async function cursorPaginate<T extends typeof BaseModel>(
  query: ModelQueryBuilderContract<T>,
  cursor: string | null,
  limit: number = 25,
  orderColumn: string = 'createdAt',
  direction: 'asc' | 'desc' = 'desc'
): Promise<{ data: InstanceType<T>[]; nextCursor: string | null }> {
  if (cursor) {
    if (direction === 'desc') {
      query.where(orderColumn, '<', cursor)
    } else {
      query.where(orderColumn, '>', cursor)
    }
  }

  const data = await query
    .orderBy(orderColumn, direction)
    .limit(limit + 1) // Fetch one extra to check if there's more

  const hasMore = data.length > limit
  if (hasMore) {
    data.pop() // Remove the extra item
  }

  const lastItem = data[data.length - 1]
  const nextCursor = hasMore && lastItem ? String((lastItem as Record<string, unknown>)[orderColumn]) : null

  return { data: data as InstanceType<T>[], nextCursor }
}

/**
 * Batch process records to avoid memory issues with large datasets
 */
export async function batchProcess<T extends typeof BaseModel>(
  query: ModelQueryBuilderContract<T>,
  batchSize: number,
  callback: (batch: InstanceType<T>[]) => Promise<void>
): Promise<number> {
  let offset = 0
  let processed = 0

  while (true) {
    const batch = await query.clone().limit(batchSize).offset(offset)

    if (batch.length === 0) break

    await callback(batch as InstanceType<T>[])
    processed += batch.length
    offset += batchSize

    if (batch.length < batchSize) break
  }

  return processed
}
