"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatIndianCurrency, formatProductDisplay } from "@/lib/utils";
import { format } from "date-fns";
import { ProductActions } from "./product-actions";
import { Search, Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductItem } from "@/app/actions/products";

export function ProductTable({ products }: { products: ProductItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(searchLower);
    const matchesLegacySize = p.size && p.size.toLowerCase().includes(searchLower);
    const matchesVariants = p.variants?.some(v => v.size.toLowerCase().includes(searchLower));
    return matchesName || matchesLegacySize || matchesVariants;
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
              <th className="py-3 px-4 text-left">Sizes Available</th>
              <th className="py-3 px-4 text-left">Invoice Render Preview</th>
              <th className="py-3 px-4 text-left">Default Rate(s)</th>
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
              filteredProducts.map((product, index) => {
                const variants = (product.variants && product.variants.length > 0)
                  ? product.variants
                  : (product.size ? [{ size: product.size, price: Number(product.price || 0) }] : []);

                return (
                  <tr key={product.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-neutral-400 font-mono text-xs align-top pt-4">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 align-top pt-4">
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        {variants.length > 1 && (
                          <span className="text-[11px] font-normal text-neutral-400">
                            {variants.length} size variants
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top pt-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {variants.length > 0 ? (
                          variants.map((v, i) => (
                            <Badge key={i} variant="secondary" className="font-mono text-xs font-normal">
                              {v.size}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-neutral-400 text-xs italic">No size</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top pt-4">
                      <div className="flex flex-col gap-1.5">
                        {variants.length > 0 ? (
                          variants.map((v, i) => (
                            <div key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-mono text-xs border border-neutral-200/60 w-fit">
                              <Sparkles className="h-3 w-3 text-neutral-400" />
                              <span>{formatProductDisplay(product.name, v.size)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-mono text-xs border border-neutral-200/60 w-fit">
                            <Sparkles className="h-3 w-3 text-neutral-400" />
                            <span>{product.name}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-900 align-top pt-4">
                      <div className="flex flex-col gap-1">
                        {variants.length > 0 ? (
                          variants.map((v, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-semibold text-neutral-900">₹{formatIndianCurrency(Number(v.price || 0))}</span>
                              {variants.length > 1 && (
                                <span className="text-neutral-400 text-[11px] ml-1 font-mono">({v.size})</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <span>₹{formatIndianCurrency(Number(product.price || 0))}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 align-top pt-4">
                      {product.createdAt ? format(new Date(product.createdAt), "MMM dd, yyyy") : "-"}
                    </td>
                    <td className="py-3 px-4 text-right pr-6 align-top pt-3">
                      <ProductActions product={product} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
