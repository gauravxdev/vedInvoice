"use client";

import { useRef } from "react";
import { format } from "date-fns";
import { Download, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIndianCurrency } from "@/lib/utils";
import Link from "next/link";

export default function InvoiceViewer({ invoice, companySettings }: { invoice: any, companySettings: any }) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    window.print();
  };

  const discountAmount = 0; // If you added discount column to db, handle it here. Assuming 0 for now.

  return (
    <div className="w-full max-w-4xl min-w-[700px] mx-auto flex flex-col pb-20 print:pb-0 print:mx-0 print:flex">
      <div className="w-full flex justify-between items-center mb-6 print:hidden">
        <Link href="/invoices">
          <Button variant="ghost" size="sm" className="text-neutral-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={handleDownloadPDF} type="button">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="w-full min-h-[1000px] print:min-h-[1000px] flex flex-col bg-white shadow-lg p-6 sm:p-10 print:shadow-none print:p-0 print:m-0 print:overflow-visible print:flex" ref={previewRef}>
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex flex-col gap-4">
            {companySettings.companyLogo ? (
              <img src={companySettings.companyLogo} alt={companySettings.companyName} className="h-16 object-contain object-left" />
            ) : (
              <h1 className="text-4xl font-black uppercase tracking-tight text-neutral-900">{companySettings.companyName}</h1>
            )}

            <div className="flex items-start gap-2 text-neutral-800 text-sm font-medium whitespace-pre-wrap mt-2 max-w-[400px]">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{companySettings.companyAddress || "Your Company Address"}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-6 shrink-0">
            <div className="flex flex-col gap-3 min-w-[280px] text-right">
              <div className="font-medium text-neutral-900 max-w-[320px] ml-auto">
                <span>{companySettings?.companyName || "Company Name"}</span>
              </div>
              <div className="font-medium text-neutral-900">
                <span>{companySettings?.phone || "Company Phone"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Header Row */}
        <div className="flex justify-end items-end mb-8 font-medium">
          <div className="flex items-center gap-2 border-b border-black pb-1">
            <span className="font-bold">Date:</span>
            <span>{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), "dd MMMM yyyy") : ""}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 mb-12 flex flex-col">
          <table className="w-full flex-1 text-xs border-collapse border border-neutral-300">
            <thead className="bg-black text-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <tr>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3 whitespace-nowrap">Sr no</th>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3">Customer Name</th>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3">Model No</th>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3 whitespace-nowrap">Qty</th>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3 whitespace-nowrap">Rate</th>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3 whitespace-nowrap">Amount</th>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3">Delivery By</th>
                <th className="border border-neutral-300 text-center font-semibold py-2 px-3">Pay Mode</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {invoice.items?.map((item: any, i: number) => (
                <tr key={i} className="h-0">
                  <td className="border border-neutral-300 py-3 px-3 text-center">{String(i + 1).padStart(2, '0')}</td>
                  <td className="border border-neutral-300 py-3 px-3 text-center">{item.customerName || invoice.customer?.name || "-"}</td>
                  <td className="border border-neutral-300 py-3 px-3 font-medium text-center">{item.productName || "-"}</td>
                  <td className="border border-neutral-300 py-3 px-3 text-center whitespace-nowrap">{item.quantity}</td>
                  <td className="border border-neutral-300 py-3 px-3 text-center whitespace-nowrap">₹{formatIndianCurrency(Number(item.unitPrice || 0))}</td>
                  <td className="border border-neutral-300 py-3 px-3 text-center font-medium whitespace-nowrap">₹{formatIndianCurrency(Number(item.total || 0))}</td>
                  <td className="border border-neutral-300 py-3 px-3 text-center">{item.deliveryBy || invoice.deliveryBy || "-"}</td>
                  <td className="border border-neutral-300 py-3 px-3 text-center">{item.paymentMode || invoice.paymentMode || "-"}</td>
                </tr>
              ))}
              {/* Filler row to stretch vertical lines */}
              <tr className="h-full">
                <td className="border-x border-neutral-300"></td>
                <td className="border-x border-neutral-300"></td>
                <td className="border-x border-neutral-300"></td>
                <td className="border-x border-neutral-300"></td>
                <td className="border-x border-neutral-300"></td>
                <td className="border-x border-neutral-300"></td>
                <td className="border-x border-neutral-300"></td>
                <td className="border-x border-neutral-300"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Sub total</span>
              <span>₹{formatIndianCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>Tax</span>
                <span>₹{formatIndianCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-3 border-t">
              <span>Total Amount</span>
              <span>₹{formatIndianCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="text-xs text-neutral-500 mt-8 pt-8 border-t">
            <span className="font-semibold">*Notes: </span>
            {invoice.notes}
          </div>
        )}
      </div>
    </div>
  );
}
