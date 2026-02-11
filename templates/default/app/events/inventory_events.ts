import { BaseEvent } from '@adonisjs/core/events'
import InventoryItem from '#models/inventory_item'
import InventoryMovement from '#models/inventory_movement'

/**
 * Inventory Adjusted Event
 * Fired when inventory quantity is manually adjusted
 */
export class InventoryAdjusted extends BaseEvent {
  constructor(
    public inventoryItem: InventoryItem,
    public movement: InventoryMovement,
    public previousQuantity: number,
    public newQuantity: number
  ) {
    super()
  }
}

/**
 * Inventory Received Event
 * Fired when new stock is received
 */
export class InventoryReceived extends BaseEvent {
  constructor(
    public inventoryItem: InventoryItem,
    public quantity: number,
    public reason?: string
  ) {
    super()
  }
}

/**
 * Inventory Transferred Event
 * Fired when inventory is transferred between locations
 */
export class InventoryTransferred extends BaseEvent {
  constructor(
    public fromItem: InventoryItem,
    public toItem: InventoryItem,
    public quantity: number
  ) {
    super()
  }
}

/**
 * Inventory Reserved Event
 * Fired when inventory is reserved for an order
 */
export class InventoryReserved extends BaseEvent {
  constructor(
    public inventoryItem: InventoryItem,
    public quantity: number,
    public orderId: string
  ) {
    super()
  }
}

/**
 * Inventory Released Event
 * Fired when reserved inventory is released (e.g. order cancelled)
 */
export class InventoryReleased extends BaseEvent {
  constructor(
    public inventoryItem: InventoryItem,
    public quantity: number,
    public reason?: string
  ) {
    super()
  }
}
