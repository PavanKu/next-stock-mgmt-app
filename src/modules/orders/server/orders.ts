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
  status?: "pending" | "confirmed" | "completed" | "cancelled";
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
 * Update product stock quantities when order is completed
 */
async function updateProductStock(
  orderId: string,
  orderType: "purchase" | "sale",
  userId: string
): Promise<void> {
  const orderItemsList = await db
    .select({
      productId: orderItems.productId,
      quantity: orderItems.quantity
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  for (const item of orderItemsList) {
    const [currentProduct] = await db
      .select({ quantity: products.quantity })
      .from(products)
      .where(eq(products.id, item.productId));

    if (!currentProduct) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Product with ID ${item.productId} not found`,
      });
    }

    const quantityChange = orderType === "purchase" ? item.quantity : -item.quantity;
    const newQuantity = currentProduct.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot complete order: would result in negative stock`,
      });
    }

    await db
      .update(products)
      .set({
        quantity: newQuantity,
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(products.id, item.productId));
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
      status: "pending",
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
export async function getOrders(filters: OrderFilters, userId: string) {
  const {
    search,
    status,
    type,
    vendorId,
    dateFrom,
    dateTo,
    page,
    pageSize
  } = filters;

  const whereConditions = [
    eq(orders.createdBy, userId),
    search ? ilike(orders.orderNumber, `%${search}%`) : undefined,
    status ? eq(orders.status, status) : undefined,
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
    .where(and(...whereConditions))
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [total] = await db
    .select({ count: count() })
    .from(orders)
    .innerJoin(vendors, eq(orders.vendorId, vendors.id))
    .where(and(...whereConditions));

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
export async function getOrderById(id: string, userId: string) {
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
    .where(and(eq(orders.id, id), eq(orders.createdBy, userId)));

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
export async function getOrderByOrderNumber(orderNumber: string, userId: string) {
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.orderNumber, orderNumber),
        eq(orders.createdBy, userId)
      )
    );

  if (!order) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Order with number ${orderNumber} not found`,
    });
  }

  return getOrderById(order.id, userId);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  id: string,
  status: "pending" | "confirmed" | "completed" | "cancelled",
  userId: string
) {
  const [existingOrder] = await db
    .select({
      id: orders.id,
      status: orders.status,
      type: orders.type,
    })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.createdBy, userId)));

  if (!existingOrder) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Order with ID ${id} not found`,
    });
  }

  // Handle stock updates when order is completed
  if (status === "completed" && existingOrder.status !== "completed") {
    await updateProductStock(id, existingOrder.type, userId);
  }

  const updateData: {
    status: "pending" | "confirmed" | "completed" | "cancelled";
    updatedBy: string;
    updatedAt: Date;
    completedAt?: Date;
  } = {
    status,
    updatedBy: userId,
    updatedAt: new Date(),
  };

  // Set completion timestamp
  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  const [updatedOrder] = await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, id))
    .returning();

  return updatedOrder;
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
 * Delete order (only if pending status)
 */
export async function deleteOrder(id: string, userId: string) {
  const [existingOrder] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.createdBy, userId)));

  if (!existingOrder) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Order with ID ${id} not found`,
    });
  }

  if (existingOrder.status !== "pending") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only pending orders can be deleted",
    });
  }

  const [deletedOrder] = await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning();

  return deletedOrder;
}
