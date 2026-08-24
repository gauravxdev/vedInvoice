import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  size: z.string().optional(),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
  tax: z.coerce.number().min(0).default(0),
  customerName: z.string().optional(),
  deliveryBy: z.string().optional(),
  paymentMode: z.string().optional(),
  discount: z.coerce.number().min(0).max(100).default(0),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name or model is required"),
  size: z.string().optional(),
  price: z.coerce.number().min(0).optional().default(0),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const invoiceSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  subject: z.string().optional(),
  invoiceDate: z.date(),
  currency: z.string().default("INR"),
  paymentMode: z.string().optional(),
  deliveryBy: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  discount: z.coerce.number().min(0).max(100).default(0),
  paymentStatus: z.string().default("Pending"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
