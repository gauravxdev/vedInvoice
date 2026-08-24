import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCurrency(num: number): string {
  if (isNaN(num)) return "0.00";
  
  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + " Cr";
  } else if (num >= 100000) {
    return (num / 100000).toFixed(2) + " L";
  } else {
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

export function formatProductDisplay(productName?: string | null, size?: string | null): string {
  if (!productName || !productName.trim()) return "-";
  const trimmedName = productName.trim();
  const trimmedSize = size?.trim();
  
  if (!trimmedSize) return trimmedName;
  // If product name already contains the formatted size, avoid duplication
  if (trimmedName.includes(`(${trimmedSize})`)) return trimmedName;
  return `${trimmedName} (${trimmedSize})`;
}
