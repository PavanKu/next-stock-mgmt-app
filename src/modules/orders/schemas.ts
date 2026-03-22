import { z } from "zod";

// Order item schema for creating orders with multiple products
export const orderItemSchema = z.object({
  productId: z.string().min(1, { message: "Product is required" }),
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  unitPrice: z.number().min(0, { message: "Unit price must be positive" }),
});

// Order creation schema
export const orderInsertSchema = z.object({
  type: z.enum(["purchase", "sale"], { message: "Order type is required" }),
  vendorId: z.string().min(1, { message: "Vendor is required" }),
  items: z.array(orderItemSchema).min(1, { message: "At least one item is required" }),
  notes: z.string().optional(),
});

// Order update schema
export const orderUpdateSchema = z.object({
  id: z.string().min(1, { message: "Order ID is required" }),
  notes: z.string().optional(),
});

// Order status update schema
export const orderStatusUpdateSchema = z.object({
  id: z.string().min(1, { message: "Order ID is required" }),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"], {
    message: "Valid status is required",
  }),
});

// Order filters schema
export const orderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  type: z.enum(["purchase", "sale"]).optional(),
  vendorId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});
