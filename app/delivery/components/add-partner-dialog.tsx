"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { addDeliveryPartnerAction } from "@/app/actions/settings";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AddPartnerDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) setError(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Please enter a partner name.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await addDeliveryPartnerAction(name.trim());
      if (res.success) {
        setOpen(false);
        setName("");
        router.refresh();
      } else {
        setError(res.error || "Failed to add partner.");
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Delivery Partner
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Delivery Partner</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2.5 my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Partner Name</Label>
            <Input 
              placeholder="e.g. Shyam" 
              value={name} 
              onChange={e => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Partner"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
