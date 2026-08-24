"use server";

import { db } from "@/lib/db";
import { InvoiceFormValues } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function getInvoiceById(id: string) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      }
    });
    return invoice;
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return null;
  }
}

export async function createInvoice(data: InvoiceFormValues) {
  try {
    const settings = await db.companySettings.findFirst();
    const showTax = settings ? settings.showTax : true;
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = showTax 
      ? data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)) * (item.tax / 100), 0)
      : 0;
      
    const itemDiscounts = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * ((item.discount || 0) / 100)), 0);
    const globalDiscountAmount = (subtotal - itemDiscounts) * (data.discount / 100);
    const totalDiscountAmount = itemDiscounts + globalDiscountAmount;
    
    const total = subtotal + tax - totalDiscountAmount;

    const primaryCustomerName = data.customerName || data.items[0]?.customerName || "Unknown Customer";

    // Get or create customer
    let customer = await db.customer.findFirst({
      where: {
        name: primaryCustomerName,
      }
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: primaryCustomerName,
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
        paymentStatus: data.paymentStatus || "Pending",
        paymentMode: data.paymentMode,
        deliveryBy: data.deliveryBy,
        items: {
          create: data.items.map(item => ({
            productId: item.productId || null,
            productName: item.productName,
            size: item.size || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            customerName: item.customerName || data.customerName,
            deliveryBy: item.deliveryBy || data.deliveryBy,
            paymentMode: item.paymentMode || data.paymentMode
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
