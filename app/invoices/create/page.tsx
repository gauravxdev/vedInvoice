"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Trash2, Printer, Download, Save, MapPin, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { cn, formatIndianCurrency } from "@/lib/utils";
import { useRef } from "react";

import { createInvoice } from "@/app/actions/invoice";
import { getCompanySettings } from "@/app/actions/settings";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function CreateInvoice() {
  const router = useRouter();
  const [companySettings, setCompanySettings] = useState<any>({
    companyName: "PRINT SHAPEE",
    companyLogo: null,
    companyAddress: "L-208, Dilshad Garden\nDelhi - 95",
    phone: "8826047824",
    email: ""
  });

  useEffect(() => {
    getCompanySettings().then((res) => {
      if (res && res.id !== "new") {
        setCompanySettings(res);
      }
    });
  }, []);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      subject: "",
      currency: "INR",
      paymentMode: "",
      deliveryBy: "",
      discount: 0,
      notes: "",
      items: [{ productName: "", quantity: 1, unitPrice: 0, tax: 0 }],
    },
  });

  const watchAll = form.watch();

  useEffect(() => {
    form.setValue("invoiceDate", new Date());
  }, [form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateSubtotal = () => {
    return watchAll.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
  };

  const calculateTax = () => {
    return watchAll.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.tax / 100)), 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const discountAmount = subtotal * ((watchAll.discount || 0) / 100);
  const total = subtotal + tax - discountAmount;

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const result = await createInvoice(data);
      if (result.success) {
        router.push("/invoices");
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert("Failed to create invoice");
    }
  };

  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    window.print();
  };

  return (
    <div className="flex h-full flex-col md:flex-row print:block">
      {/* LEFT: FORM */}
      <div className="w-full md:w-[450px] lg:w-[500px] shrink-0 p-6 overflow-y-auto border-r bg-white print:hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Invoice Detail</h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-neutral-100">
              <CardTitle className="text-sm font-medium">Billed to</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input {...form.register("customerName")} placeholder="e.g. Darlene Robertson" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile No</Label>
                  <Input {...form.register("customerPhone")} placeholder="e.g. 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...form.register("customerEmail")} placeholder="e.g. darlene@email.com" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input {...form.register("subject")} placeholder="e.g. Electronic purchasing" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger
                      className={cn(
                        "flex h-9 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        !watchAll.invoiceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchAll.invoiceDate ? format(watchAll.invoiceDate, "dd MMMM yyyy") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watchAll.invoiceDate}
                        onSelect={(date: any) => date && form.setValue("invoiceDate", date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-neutral-100">
              <CardTitle className="text-sm font-medium">Product</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <Input {...form.register(`items.${index}.productName` as const)} placeholder="Item name" />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input type="number" {...form.register(`items.${index}.unitPrice` as const)} placeholder="Price" />
                      </div>
                    </div>
                  </div>
                  <div className="w-20 space-y-2">
                    <Input type="number" {...form.register(`items.${index}.quantity` as const)} placeholder="Qty" />
                  </div>
                  <div className="w-24 space-y-2">
                    <Select onValueChange={(v) => form.setValue(`items.${index}.tax`, Number(v))} defaultValue="0">
                      <SelectTrigger>
                        <SelectValue placeholder="Tax" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tax: 0%</SelectItem>
                        <SelectItem value="5">Tax: 5%</SelectItem>
                        <SelectItem value="10">Tax: 10%</SelectItem>
                        <SelectItem value="20">Tax: 20%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-full text-green-600 hover:text-green-700 border-dashed" onClick={() => append({ productName: "", quantity: 1, unitPrice: 0, tax: 0 })}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Line
              </Button>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Delivery By</Label>
                  <Input {...form.register("deliveryBy")} placeholder="e.g. DHL" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Input {...form.register("paymentMode")} placeholder="e.g. Cash, Credit Card" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input type="number" {...form.register("discount")} placeholder="e.g. 10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea {...form.register("notes")} placeholder="Add Notes" className="min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

        </form>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="w-full flex-1 bg-neutral-100 p-6 overflow-auto flex flex-col items-center print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
        <div className="w-full max-w-4xl min-w-[700px] flex justify-between items-center mb-6 print:hidden">
          <h2 className="text-xl font-bold tracking-tight">Preview</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white" onClick={handleDownloadPDF} type="button">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" className="bg-white" type="button">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={form.handleSubmit(onSubmit)}>
              Save Invoice
            </Button>
          </div>
        </div>

        <div className="w-full max-w-4xl min-w-[700px] min-h-[1000px] flex flex-col bg-white shadow-lg p-10 print:shadow-none" ref={previewRef}>
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex flex-col gap-4">
              {companySettings.companyLogo ? (
                <img src={companySettings.companyLogo} alt={companySettings.companyName} className="h-16 object-contain object-left" />
              ) : (
                <h1 className="text-4xl font-black uppercase tracking-tight text-neutral-900">{companySettings.companyName}</h1>
              )}
              
              <div className="flex items-start gap-2 text-neutral-800 text-sm font-medium whitespace-pre-wrap mt-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{companySettings.companyAddress || "Your Company Address"}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-6">
              <div className="px-6 py-4 flex flex-col gap-3 min-w-[280px]">
                <div className="flex items-center gap-3 font-medium text-neutral-900">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{watchAll.customerPhone || "Mobile No"}</span>
                </div>
                <div className="flex items-center gap-3 font-medium text-neutral-900">
                  <User className="h-4 w-4 shrink-0" />
                  <span>{watchAll.customerName || "Customer Name"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Header Row */}
          <div className="flex justify-end items-end mb-8 font-medium">
            <div className="flex items-center gap-2 border-b border-black pb-1 min-w-[200px]">
              <span className="font-bold">Date:</span>
              <span className="pl-2">{watchAll.invoiceDate ? format(watchAll.invoiceDate, "dd MMMM yyyy") : ""}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1 mb-12 flex flex-col">
            <table className="w-full h-full text-xs border-collapse border border-neutral-300">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="border border-neutral-300 text-center font-semibold py-2 px-3 whitespace-nowrap">Sr no</th>
                  <th className="border border-neutral-300 text-left font-semibold py-2 px-3">Customer Name</th>
                  <th className="border border-neutral-300 text-left font-semibold py-2 px-3">Model No</th>
                  <th className="border border-neutral-300 text-right font-semibold py-2 px-3 whitespace-nowrap">Rate</th>
                  <th className="border border-neutral-300 text-right font-semibold py-2 px-3 whitespace-nowrap">Amount</th>
                  <th className="border border-neutral-300 text-center font-semibold py-2 px-3 whitespace-nowrap">Qty</th>
                  <th className="border border-neutral-300 text-left font-semibold py-2 px-3">Delivery By</th>
                  <th className="border border-neutral-300 text-left font-semibold py-2 px-3">Pay Mode</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {watchAll.items?.map((item, i) => (
                  <tr key={i} className="h-0">
                    <td className="border border-neutral-300 py-3 px-3 text-center">{String(i + 1).padStart(3, '0')}</td>
                    <td className="border border-neutral-300 py-3 px-3">{watchAll.customerName || "-"}</td>
                    <td className="border border-neutral-300 py-3 px-3 font-medium">{item.productName || "-"}</td>
                    <td className="border border-neutral-300 py-3 px-3 text-right whitespace-nowrap">₹{formatIndianCurrency(Number(item.unitPrice || 0))}</td>
                    <td className="border border-neutral-300 py-3 px-3 text-right font-medium whitespace-nowrap">₹{formatIndianCurrency(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</td>
                    <td className="border border-neutral-300 py-3 px-3 text-center whitespace-nowrap">{item.quantity}</td>
                    <td className="border border-neutral-300 py-3 px-3">{watchAll.deliveryBy || "-"}</td>
                    <td className="border border-neutral-300 py-3 px-3">{watchAll.paymentMode || "-"}</td>
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
                <span>₹{formatIndianCurrency(subtotal)}</span>
              </div>
              {watchAll.discount > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Discount -{watchAll.discount}%</span>
                  <span>-₹{formatIndianCurrency(discountAmount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Tax</span>
                  <span>₹{formatIndianCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Amount due</span>
                <span>₹{formatIndianCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {watchAll.notes && (
            <div className="text-xs text-neutral-500 mt-8 pt-8 border-t">
              <span className="font-semibold">*Notes: </span>
              {watchAll.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
