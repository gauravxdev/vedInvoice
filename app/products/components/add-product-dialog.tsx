"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { createProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setError(null);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Please enter a product name or model number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await createProduct({
        name: name.trim(),
        size: size.trim() || undefined,
        price: price ? Number(price) : 0,
      });
      if (res.success) {
        setOpen(false);
        setName("");
        setSize("");
        setPrice("");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2.5 my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="product-name">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-size">Size (Optional)</Label>
            <Input 
              id="product-size"
              placeholder="e.g. 25*50mm" 
              value={size} 
              onChange={e => setSize(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Will render on invoices as <span className="font-mono font-medium">{name || "SA-51"}{size ? ` (${size})` : " (25*50mm)"}</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Default Price / Rate (₹) (Optional)</Label>
            <Input 
              id="product-price"
              type="number"
              min="0"
              step="any"
              placeholder="0.00" 
              value={price} 
              onChange={e => setPrice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <p className="text-xs text-muted-foreground">
              Suggested rate. You can customize the rate per customer when creating invoices.
            </p>
          </div>
          <Button onClick={handleAdd} disabled={loading} className="w-full bg-black hover:bg-neutral-800 text-white">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Catalogue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
