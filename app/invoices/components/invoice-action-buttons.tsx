"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getInvoiceById } from "@/app/actions/invoice";
import { getCompanySettings } from "@/app/actions/settings";
import InvoiceViewer from "@/app/invoices/[id]/components/invoice-viewer";
import { DialogTitle } from "@/components/ui/dialog";

export function InvoiceActionButtons({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInvoiceData = async () => {
    setLoading(true);
    const [invData, setyData] = await Promise.all([
      getInvoiceById(invoiceId),
      getCompanySettings()
    ]);
    setInvoice(invData);
    setSettings(setyData);
    setLoading(false);
    return { invData, setyData };
  };

  const handlePreview = async () => {
    if (!invoice) {
      await fetchInvoiceData();
    }
    setOpen(true);
  };

  const handleDownload = () => {
    window.open(`/invoices/${invoiceId}?print=true`, '_blank');
  };

  return (
    <>
      <td className="py-3 px-4 text-center">
        <Button variant="ghost" size="icon" onClick={handlePreview} title="Preview Invoice">
          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </td>
      <td className="py-3 px-4 text-center">
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download PDF directly">
          <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </td>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-neutral-50 print:bg-white print:max-w-none print:max-h-none print:p-0 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
          
          {loading ? (
            <div className="flex items-center justify-center p-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invoice && settings ? (
            <div className="p-4 md:p-8">
              <InvoiceViewer invoice={invoice} companySettings={settings} />
            </div>
          ) : (
            <div className="p-12 text-center text-red-500">Failed to load invoice</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
