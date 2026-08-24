"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatIndianCurrency, formatProductDisplay } from "@/lib/utils";
import { format } from "date-fns";
import { ProductActions } from "./product-actions";
import { Search, Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductItem {
  id: string;
  name: string;
  size?: string | null;
  price?: number | null;
  createdAt: string | Date;
}

export function ProductTable({ products }: { products: ProductItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      (p.size && p.size.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or size..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> of {products.length} products
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[750px]">
          <thead className="bg-neutral-50 border-b text-neutral-600 font-medium">
            <tr>
              <th className="py-3 px-4 text-center w-[70px]">Sr No</th>
              <th className="py-3 px-4 text-left">Product / Model No</th>
              <th className="py-3 px-4 text-left">Size</th>
              <th className="py-3 px-4 text-left">Invoice Render Preview</th>
              <th className="py-3 px-4 text-left">Default Rate</th>
              <th className="py-3 px-4 text-left">Added On</th>
              <th className="py-3 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-neutral-300" />
                    <p className="font-medium text-neutral-600">No products found</p>
                    <p className="text-xs text-neutral-400">
                      {searchTerm ? "Try a different search query" : "Click 'Add Product' to create your first catalogue item"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr key={product.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 text-center text-neutral-400 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900">
                    {product.name}
                  </td>
                  <td className="py-3 px-4">
                    {product.size ? (
                      <Badge variant="secondary" className="font-mono text-xs font-normal">
                        {product.size}
                      </Badge>
                    ) : (
                      <span className="text-neutral-400 text-xs italic">No size</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 font-mono text-xs border border-neutral-200/60">
                      <Sparkles className="h-3 w-3 text-neutral-400" />
                      <span>{formatProductDisplay(product.name, product.size)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    ₹{formatIndianCurrency(Number(product.price || 0))}
                  </td>
                  <td className="py-3 px-4 text-xs text-neutral-500">
                    {product.createdAt ? format(new Date(product.createdAt), "MMM dd, yyyy") : "-"}
                  </td>
                  <td className="py-3 px-4 text-right pr-6">
                    <ProductActions product={product} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
