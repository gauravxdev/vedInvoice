"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCompanySettings() {
  const settings = await db.companySettings.findFirst();
  return settings || {
    id: "new",
    companyName: "Your Company",
    companyLogo: null,
    companyAddress: "",
    gstNumber: "",
    phone: "",
    email: ""
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
}) {
  try {
    const existing = await db.companySettings.findFirst();
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
        }
      });
    } else {
      await db.companySettings.create({
        data: {
          companyName: data.companyName,
          companyLogo: data.companyLogo,
          companyAddress: data.companyAddress,
          gstNumber: data.gstNumber,
          phone: data.phone,
          email: data.email,
        }
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
