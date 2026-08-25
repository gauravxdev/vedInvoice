"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, AlertCircle, Loader2, Plus, Sparkles, Layers } from "lucide-react";
import { updateProduct, deleteProduct, ProductItem } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VariantRow {
  size: string;
  price: string;
}

export function ProductActions({ product }: { product: ProductItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const openEditModal = () => {
    setName(product.name);
    if (product.variants && product.variants.length > 0) {
      setVariants(
        product.variants.map(v => ({
          size: v.size,
          price: v.price ? String(v.price) : "",
        }))
      );
    } else if (product.size) {
      setVariants([
        {
          size: product.size,
          price: product.price ? String(product.price) : "",
        },
      ]);
    } else {
      setVariants([{ size: "", price: "" }]);
    }
    setError(null);
    setEditOpen(true);
  };

  const handleAddVariant = () => {
    setVariants(prev => [...prev, { size: "", price: "" }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantRow, value: string) => {
    setVariants(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    if (error) setError(null);
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!variants[0]?.size?.trim()) {
      setError("First size is compulsory. Please enter a size (e.g. 25*50mm).");
      return;
    }

    for (let i = 1; i < variants.length; i++) {
      if (!variants[i].size.trim()) {
        setError(`Size #${i + 1} is empty. Please enter a size or remove the row.`);
        return;
      }
    }

    setError(null);
    setLoading(true);
    try {
      const formattedVariants = variants.map(v => ({
        size: v.size.trim(),
        price: v.price ? Number(v.price) : 0,
      }));

      const res = await updateProduct(product.id, {
        name: name.trim(),
        variants: formattedVariants,
      });

      if (res.success) {
        setEditOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update product.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await deleteProduct(product.id);
      if (res.success) {
        setDeleteOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to delete product.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete product.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-neutral-500 hover:text-black"
          onClick={openEditModal}
          title="Edit Product"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            setError(null);
            setDeleteOpen(true);
          }}
          title="Delete Product"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Product</DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="py-2.5 my-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-product-name" className="text-sm font-semibold">
                Product Name / Model No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-product-name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className="bg-white"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-neutral-600" />
                  <Label className="text-sm font-semibold">
                    Sizes & Rates ({variants.length})
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                  className="h-7 text-xs border-dashed border-neutral-300 hover:border-black hover:bg-neutral-50"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Another Size
                </Button>
              </div>

              <div className="space-y-2.5 bg-neutral-50/80 p-3 rounded-lg border border-neutral-200/80">
                {variants.map((v, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-md border border-neutral-200/60 shadow-xs">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span>Size {idx === 0 ? <span className="text-red-500 font-bold">* (Compulsory)</span> : `#${idx + 1}`}</span>
                      </div>
                      <Input
                        placeholder={idx === 0 ? "e.g. 25*50mm" : `e.g. ${idx === 1 ? "30*60mm" : "40*80mm"}`}
                        value={v.size}
                        onChange={e => handleVariantChange(idx, "size", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>

                    <div className="w-[140px] space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">
                        Rate (₹)
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={v.price}
                        onChange={e => handleVariantChange(idx, "price", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>

                    {variants.length > 1 && (
                      <div className="pt-5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-neutral-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                          title="Remove Size"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Live Invoice Preview */}
              <div className="bg-neutral-100/70 p-3 rounded-lg border border-neutral-200/70 space-y-1.5">
                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-600">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Invoice Render Preview:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {variants.some(v => v.size.trim()) ? (
                    variants
                      .filter(v => v.size.trim())
                      .map((v, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-white border border-neutral-300 text-neutral-800">
                          {name.trim() || "SA-51"} ({v.size.trim()})
                          {v.price ? ` @ ₹${v.price}` : ""}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-neutral-400 italic">
                      {name.trim() || "SA-51"} (25*50mm)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleUpdate} 
              disabled={loading} 
              className="w-full bg-black hover:bg-neutral-800 text-white mt-2 h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{product.name}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="py-2.5 my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
