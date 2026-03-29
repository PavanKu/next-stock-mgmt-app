import { db } from "@/db";
import { orderItems, orders, products, vendors } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, gte, ilike, inArray, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

interface CreateOrderInput {
  type: "purchase" | "sale";
  vendorId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

interface OrderFilters {
  search?: string;
  type?: "purchase" | "sale";
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

/**
 * Generate unique order number based on type and current year
 * Format: PO-YYYY-NNNN for purchase, SO-YYYY-NNNN for sale
 */
async function generateOrderNumber(type: "purchase" | "sale"): Promise<string> {
  const prefix = type === "purchase" ? "PO" : "SO";
  const year = new Date().getFullYear();
  const yearPrefix = `${prefix}-${year}-`;

  // Get the latest order number for this year and type
  const latestOrder = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(
      and(
        eq(orders.type, type),
        ilike(orders.orderNumber, `${yearPrefix}%`)
      )
    )
    .orderBy(desc(orders.orderNumber))
    .limit(1);

  let nextNumber = 1;
  if (latestOrder.length > 0) {
    const lastNumber = latestOrder[0].orderNumber.split('-').pop();
    nextNumber = parseInt(lastNumber || '0', 10) + 1;
  }

  return `${yearPrefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Validate stock availability for sale orders
 */
async function validateStockAvailability(items: CreateOrderInput['items']): Promise<void> {
  const productIds = items.map(item => item.productId);
  const productStocks = await db
    .select({
      id: products.id,
      name: products.name,
      quantity: products.quantity
    })
    .from(products)
    .where(inArray(products.id, productIds));

  for (const item of items) {
    const product = productStocks.find(p => p.id === item.productId);
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Product with ID ${item.productId} not found`,
      });
    }

    if (product.quantity < item.quantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
      });
    }
  }
}

/**
 * Create a new order with items
 */
export async function createOrder(input: CreateOrderInput, userId: string) {
  // Validate stock for sale orders
  if (input.type === "sale") {
    await validateStockAvailability(input.items);
  }

  // Verify vendor exists
  const [vendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.id, input.vendorId));

  if (!vendor) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Vendor with ID ${input.vendorId} not found`,
    });
  }

  // Generate order number
  const orderNumber = await generateOrderNumber(input.type);

  // Calculate total amount
  const totalAmount = input.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice),
    0
  );

  // Create order
  const [createdOrder] = await db
    .insert(orders)
    .values({
      id: nanoid(),
      orderNumber,
      type: input.type,
      vendorId: input.vendorId,
      totalAmount: totalAmount.toString(),
      notes: input.notes,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  // Create order items
  const orderItemsData = input.items.map(item => ({
    id: nanoid(),
    orderId: createdOrder.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    totalPrice: (item.quantity * item.unitPrice).toString(),
    createdBy: userId,
    updatedBy: userId,
  }));

  await db.insert(orderItems).values(orderItemsData);

  return createdOrder;
}

/**
 * Get orders with filtering and pagination
 */
export async function getOrders(filters: OrderFilters) {
  const {
    search,
    type,
    vendorId,
    dateFrom,
    dateTo,
    page,
    pageSize
  } = filters;

  const whereConditions = [
    search ? ilike(orders.orderNumber, `%${search}%`) : undefined,
    type ? eq(orders.type, type) : undefined,
    vendorId ? eq(orders.vendorId, vendorId) : undefined,
    dateFrom ? gte(orders.orderDate, new Date(dateFrom)) : undefined,
    dateTo ? lte(orders.orderDate, new Date(dateTo)) : undefined,
  ].filter(Boolean);

  const data = await db
    .select({
      ...getTableColumns(orders),
      vendor: {
        id: vendors.id,
        name: vendors.name,
      },
    })
    .from(orders)
    .innerJoin(vendors, eq(orders.vendorId, vendors.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [total] = await db
    .select({ count: count() })
    .from(orders)
    .innerJoin(vendors, eq(orders.vendorId, vendors.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

  const totalPages = Math.ceil(total.count / pageSize);

  return {
    items: data,
    total: total.count,
    pages: totalPages,
  };
}

/**
 * Get single order by ID with items
 */
export async function getOrderById(id: string) {
  const [order] = await db
    .select({
      ...getTableColumns(orders),
      vendor: {
        id: vendors.id,
        name: vendors.name,
        email: vendors.email,
        phone: vendors.phone,
      },
    })
    .from(orders)
    .innerJoin(vendors, eq(orders.vendorId, vendors.id))
    .where(eq(orders.id, id));

  if (!order) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Order with ID ${id} not found`,
    });
  }

  // Get order items with product details
  const items = await db
    .select({
      ...getTableColumns(orderItems),
      product: {
        id: products.id,
        name: products.name,
        sku: products.sku,
      },
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));

  return {
    ...order,
    items,
  };
}

/**
 * Get order by order number
 */
export async function getOrderByOrderNumber(orderNumber: string) {
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber));

  if (!order) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Order with number ${orderNumber} not found`,
    });
  }

  return getOrderById(order.id);
}

/**
 * Update order notes
 */
export async function updateOrder(
  id: string,
  updates: { notes?: string },
  userId: string
) {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      ...updates,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(orders.id, id), eq(orders.createdBy, userId)))
    .returning();

  if (!updatedOrder) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Order with ID ${id} not found`,
    });
  }

  return updatedOrder;
}

/**
 * Delete order
 */
export async function deleteOrder(id: string) {
  const [existingOrder] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.id, id));

  if (!existingOrder) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Order with ID ${id} not found`,
    });
  }

  const [deletedOrder] = await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning();

  return deletedOrder;
}