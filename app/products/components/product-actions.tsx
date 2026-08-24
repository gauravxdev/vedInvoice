"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { updateProduct, deleteProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProductActions({ product }: { product: { id: string; name: string; size?: string | null; price?: number | null } }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [size, setSize] = useState(product.size || "");
  const [price, setPrice] = useState(product.price ? String(product.price) : "0");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await updateProduct(product.id, {
        name: name.trim(),
        size: size.trim() || undefined,
        price: price ? Number(price) : 0,
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
          onClick={() => {
            setName(product.name);
            setSize(product.size || "");
            setPrice(product.price ? String(product.price) : "0");
            setError(null);
            setEditOpen(true);
          }}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="py-2.5 my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-product-name">
                Product Name / Model No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-product-name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-size">Size (Optional)</Label>
              <Input
                id="edit-product-size"
                placeholder="e.g. 65*41mm"
                value={size}
                onChange={e => setSize(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-price">Default Price / Rate (₹)</Label>
              <Input
                id="edit-product-price"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={e => setPrice(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUpdate()}
              />
            </div>
            <Button onClick={handleUpdate} disabled={loading} className="w-full bg-black hover:bg-neutral-800 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
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
