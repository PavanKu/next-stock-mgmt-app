import { z } from "zod";

export const productsInsertSchema = z.object({
    sku: z.string().min(1, {message: "SKU is required"}),
    name: z.string().min(1, {message: "Name is required"}),
    description: z.string().optional(),
    costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, {message: "Cost price must be a valid decimal with up to 2 decimal places"}).optional().or(z.literal("")),
    sellingPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, {message: "Selling price must be a valid decimal with up to 2 decimal places"}).optional().or(z.literal(""))
});

export const productsUpdateSchema = productsInsertSchema.extend({
    id: z.string().min(1, {message: "Id is required"})
});
