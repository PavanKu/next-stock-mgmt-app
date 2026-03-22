import { z } from "zod";

export const vendorsInsertSchema = z.object({
    name: z.string().min(1, {message: "Name is required"}),
    email: z.string().email({message: "Invalid email format"}).optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional()
});

export const vendorsUpdateSchema = vendorsInsertSchema.extend({
    id: z.string().min(1, {message: "Id is required"})
});
