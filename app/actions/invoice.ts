"use server";

import { db } from "@/lib/db";
import { InvoiceFormValues } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: InvoiceFormValues) {
  try {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.tax / 100), 0);
    const discountAmount = subtotal * (data.discount / 100);
    const total = subtotal + tax - discountAmount;

    // Get or create customer
    let customer = await db.customer.findFirst({
      where: {
        name: data.customerName,
      }
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: data.customerName,
          phone: data.customerPhone,
          address: data.customerAddress,
        }
      });
    }

    // Generate Invoice Number
    const count = await db.invoice.count();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        customerId: customer.id,
        invoiceDate: data.invoiceDate,
        subtotal,
        tax,
        total,
        notes: data.notes,
        paymentStatus: "Pending",
        paymentMode: data.paymentMode,
        deliveryBy: data.deliveryBy,
        items: {
          create: data.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      }
    });

    revalidatePath("/");
    revalidatePath("/invoices");

    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { paymentStatus: status },
    });
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("Failed to update invoice status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
