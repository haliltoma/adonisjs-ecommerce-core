import { randomBytes } from 'node:crypto'

export function generateAppKey(length = 32): string {
  return randomBytes(length).toString('base64').slice(0, length)
}

export function generateSecretKey(length = 64): string {
  return randomBytes(length).toString('hex').slice(0, length)
}
