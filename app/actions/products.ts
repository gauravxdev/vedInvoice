"use server";

import { db } from "@/lib/db";
import { ProductFormValues } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface ProductVariant {
  size: string;
  price: number;
}

export interface ProductItem {
  id: string;
  name: string;
  size?: string | null;
  price?: number | null;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function normalizeProduct(p: any): ProductItem {
  let variants: ProductVariant[] = [];
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    variants = p.variants
      .map((v: any) => ({
        size: String(v.size || "").trim(),
        price: Number(v.price) || 0,
      }))
      .filter((v: ProductVariant) => !!v.size);
  }
  if (variants.length === 0 && p.size) {
    variants = [
      {
        size: String(p.size).trim(),
        price: Number(p.price) || 0,
      },
    ];
  }
  const primaryVariant = variants[0];
  return {
    id: p.id,
    name: p.name,
    size: primaryVariant ? primaryVariant.size : p.size || null,
    price: primaryVariant ? primaryVariant.price : Number(p.price) || 0,
    variants,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt || new Date().toISOString()),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt || new Date().toISOString()),
  };
}

function readLocalProducts(): ProductItem[] {
  try {
    ensureFileExists();
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    const parsed = JSON.parse(data || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeProduct) : [];
  } catch (err) {
    console.error("Error reading local products:", err);
    return [];
  }
}

function writeLocalProducts(products: ProductItem[]) {
  try {
    ensureFileExists();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local products:", err);
  }
}

export async function getProducts(): Promise<{ success: boolean; data: ProductItem[]; error?: string }> {
  try {
    if ((db as any)?.product?.findMany) {
      try {
        const dbProducts = await (db as any).product.findMany({
          orderBy: { createdAt: "desc" },
        });
        if (dbProducts && Array.isArray(dbProducts)) {
          const localProducts = readLocalProducts();
          const localMap = new Map(localProducts.map(p => [p.id, p]));
          return {
            success: true,
            data: dbProducts.map((p: any) => {
              const matchedLocal = localMap.get(p.id);
              return normalizeProduct({
                ...p,
                variants: matchedLocal?.variants || (p.size ? [{ size: p.size, price: Number(p.price) || 0 }] : []),
              });
            }),
          };
        }
      } catch (dbErr) {
        console.warn("Prisma DB product query failed, using local storage:", dbErr);
      }
    }

    const localProducts = readLocalProducts();
    return { success: true, data: localProducts };
  } catch (error: any) {
    console.error("Failed to get products:", error);
    const localProducts = readLocalProducts();
    return { success: true, data: localProducts };
  }
}

export async function createProduct(data: ProductFormValues): Promise<{ success: boolean; data?: ProductItem; error?: string }> {
  try {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, error: "Product name or model is required." };
    }

    // Parse and validate variants
    let variants: ProductVariant[] = [];
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      variants = data.variants
        .map(v => ({
          size: String(v.size || "").trim(),
          price: Number(v.price) || 0,
        }))
        .filter(v => !!v.size);
    } else if (data.size && data.size.trim()) {
      variants = [
        {
          size: data.size.trim(),
          price: Number(data.price) || 0,
        },
      ];
    }

    if (variants.length === 0 || !variants[0].size) {
      return { success: false, error: "Size is compulsory. Please provide at least one size." };
    }

    const primaryVariant = variants[0];

    const newProduct: ProductItem = {
      id: randomUUID(),
      name: trimmedName,
      size: primaryVariant.size,
      price: primaryVariant.price,
      variants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attempt DB creation if available
    if ((db as any)?.product?.create) {
      try {
        const created = await (db as any).product.create({
          data: {
            name: newProduct.name,
            size: newProduct.size,
            price: newProduct.price,
          },
        });
        if (created) {
          newProduct.id = created.id;
        }
      } catch (dbErr) {
        console.warn("Prisma DB product create failed, saving to local store:", dbErr);
      }
    }

    // Always keep local store in sync
    const current = readLocalProducts();
    current.unshift(newProduct);
    writeLocalProducts(current);

    revalidatePath("/products");
    revalidatePath("/invoices/create");
    return { success: true, data: newProduct };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { success: false, error: error?.message || "Failed to create product." };
  }
}

export async function updateProduct(id: string, data: ProductFormValues): Promise<{ success: boolean; data?: ProductItem; error?: string }> {
  try {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, error: "Product name or model is required." };
    }

    // Parse and validate variants
    let variants: ProductVariant[] = [];
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      variants = data.variants
        .map(v => ({
          size: String(v.size || "").trim(),
          price: Number(v.price) || 0,
        }))
        .filter(v => !!v.size);
    } else if (data.size && data.size.trim()) {
      variants = [
        {
          size: data.size.trim(),
          price: Number(data.price) || 0,
        },
      ];
    }

    if (variants.length === 0 || !variants[0].size) {
      return { success: false, error: "Size is compulsory. Please provide at least one size." };
    }

    const primaryVariant = variants[0];

    // Attempt DB update
    if ((db as any)?.product?.update) {
      try {
        await (db as any).product.update({
          where: { id },
          data: {
            name: trimmedName,
            size: primaryVariant.size,
            price: primaryVariant.price,
          },
        });
      } catch (dbErr) {
        console.warn("Prisma DB product update failed, updating local store:", dbErr);
      }
    }

    // Update local store
    const current = readLocalProducts();
    const index = current.findIndex(p => p.id === id);
    if (index !== -1) {
      current[index] = {
        ...current[index],
        name: trimmedName,
        size: primaryVariant.size,
        price: primaryVariant.price,
        variants,
        updatedAt: new Date().toISOString(),
      };
      writeLocalProducts(current);
    }

    revalidatePath("/products");
    revalidatePath("/invoices/create");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return { success: false, error: error?.message || "Failed to update product." };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Attempt DB delete
    if ((db as any)?.product?.delete) {
      try {
        await (db as any).product.delete({
          where: { id },
        });
      } catch (dbErr) {
        console.warn("Prisma DB product delete failed, deleting from local store:", dbErr);
      }
    }

    // Delete from local store
    const current = readLocalProducts();
    const filtered = current.filter(p => p.id !== id);
    writeLocalProducts(filtered);

    revalidatePath("/products");
    revalidatePath("/invoices/create");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return { success: false, error: error?.message || "Failed to delete product." };
  }
}
