"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInvoiceStatus } from "@/app/actions/invoice";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";

export function StatusDropdown({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;
    startTransition(async () => {
      const res = await updateInvoiceStatus(invoiceId, newStatus);
      if (res.error) {
        console.error("Failed to update status:", res.error);
      }
    });
  };

  return (
    <Select value={currentStatus || "Pending"} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className={`h-8 w-[100px] text-xs font-semibold ${
        currentStatus === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      } border-none`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Pending">Pending</SelectItem>
        <SelectItem value="Paid">Paid</SelectItem>
      </SelectContent>
    </Select>
  );
}
