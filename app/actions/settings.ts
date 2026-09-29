"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

const DEFAULT_PAYMENT_MODES = "Cash,PhonePe,Paytm,GPay,Amazon Pay,Card";

export async function getCompanySettings() {
  const { userId } = await auth();
  const settings = userId ? await db.companySettings.findFirst({ where: { userId } }) : null;

  return settings ? {
    ...settings,
    paymentModes: (settings as any).paymentModes || DEFAULT_PAYMENT_MODES,
  } : {
    id: "new",
    companyName: "Your Company",
    companyLogo: null,
    companyAddress: "",
    gstNumber: "",
    phone: "",
    email: "",
    showTax: true,
    taxRates: "0,5,10,20",
    deliveryPartners: "Partner 1,Partner 2",
    paymentModes: DEFAULT_PAYMENT_MODES,
  };
}

export async function updateCompanySettings(data: {
  id?: string;
  companyName: string;
  companyLogo?: string | null;
  companyAddress?: string;
  gstNumber?: string;
  phone?: string;
  email?: string;
  showTax: boolean;
  taxRates: string;
  deliveryPartners?: string;
  paymentModes?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const existing = await db.companySettings.findFirst({ where: { userId } });
    if (existing) {
      await db.companySettings.update({
        where: { id: existing.id },
        data: {
          companyName: data.companyName,
          companyLogo: data.companyLogo,
          companyAddress: data.companyAddress,
          gstNumber: data.gstNumber,
          phone: data.phone,
          email: data.email,
          showTax: data.showTax,
          taxRates: data.taxRates,
          deliveryPartners: data.deliveryPartners,
          paymentModes: data.paymentModes || DEFAULT_PAYMENT_MODES,
        } as any
      });
    } else {
      await db.companySettings.create({
        data: {
          userId,
          companyName: data.companyName,
          companyLogo: data.companyLogo,
          companyAddress: data.companyAddress,
          gstNumber: data.gstNumber,
          phone: data.phone,
          email: data.email,
          showTax: data.showTax,
          taxRates: data.taxRates,
          deliveryPartners: data.deliveryPartners,
          paymentModes: data.paymentModes || DEFAULT_PAYMENT_MODES,
        } as any
      });
    }
    revalidatePath("/settings");
    revalidatePath("/invoices/create");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings", error);
    return { success: false, error: "Failed to save settings" };
  }
}

export async function addDeliveryPartnerAction(partnerName: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const settings = await getCompanySettings();
    const currentPartners = settings.deliveryPartners ? settings.deliveryPartners.split(",").filter(Boolean) : [];
    if (!currentPartners.includes(partnerName)) {
      currentPartners.push(partnerName);
      
      const existing = await db.companySettings.findFirst({ where: { userId } });
      if (existing) {
        await db.companySettings.update({
          where: { id: existing.id },
          data: {
            deliveryPartners: currentPartners.join(",")
          }
        });
      } else {
        await db.companySettings.create({
          data: {
            userId,
            companyName: "Your Company",
            deliveryPartners: currentPartners.join(",")
          }
        });
      }
      
      revalidatePath("/delivery");
      revalidatePath("/invoices/create");
      revalidatePath("/settings");
      return { success: true };
    }
    return { success: false, error: "Partner already exists" };
  } catch (error) {
    console.error("Failed to add partner", error);
    return { success: false, error: "Failed to add partner" };
  }
}
