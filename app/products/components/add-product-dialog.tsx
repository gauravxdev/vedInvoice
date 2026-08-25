"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, AlertCircle, Loader2, Sparkles, Layers } from "lucide-react";
import { createProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VariantRow {
  size: string;
  price: string;
}

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: "", price: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setError(null);
    }
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

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Please enter a product name or model number.");
      return;
    }

    if (!variants[0]?.size?.trim()) {
      setError("First size is compulsory. Please enter a size (e.g. 25*50mm).");
      return;
    }

    // Check if any additional variants are partially filled with empty size
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

      const res = await createProduct({
        name: name.trim(),
        variants: formattedVariants,
      });

      if (res.success) {
        setOpen(false);
        setName("");
        setVariants([{ size: "", price: "" }]);
        router.refresh();
      } else {
        setError(res.error || "Failed to add product.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button className="bg-black hover:bg-neutral-800 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      } />
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Product</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2.5 my-1">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="product-name" className="text-sm font-semibold">
              Product Name / Model No <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="product-name"
              placeholder="e.g. SA-51" 
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
            onClick={handleAdd} 
            disabled={loading} 
            className="w-full bg-black hover:bg-neutral-800 text-white mt-2 h-10"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              `Add Product${variants.length > 1 ? ` (${variants.length} Sizes)` : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
