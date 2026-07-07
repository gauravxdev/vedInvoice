import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import Link from "next/link";
import { formatIndianCurrency } from "@/lib/utils";
import { StatusDropdown } from "./components/status-dropdown";

export default async function InvoicesPage() {
  let invoices: any[] = [];
  let dbError = false;

  try {
    invoices = await db.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: true,
        items: {
          take: 1, // Get the first item to show on the dashboard
        },
        _count: {
          select: { items: true },
        },
      },
    });
  } catch (error) {
    dbError = true;
    console.error("Database connection error:", error);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <Link href="/invoices/create">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {dbError && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Database Connection Error</h3>
          <p>We could not connect to your database. Please make sure your database server is running.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Sr no</th>
                  <th className="py-3 px-4 text-left font-medium">Customer Name</th>
                  <th className="py-3 px-4 text-left font-medium">Model No</th>
                  <th className="py-3 px-4 text-left font-medium">Rate</th>
                  <th className="py-3 px-4 text-left font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Qty</th>
                  <th className="py-3 px-4 text-left font-medium">Delivery By</th>
                  <th className="py-3 px-4 text-left font-medium">Pay Mode</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-4 text-center text-muted-foreground">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice, index) => (
                    <tr key={invoice.id}>
                      <td className="py-3 px-4 font-medium text-center">{String(index + 1).padStart(3, '0')}</td>
                      <td className="py-3 px-4">{invoice.customer.name}</td>
                      <td className="py-3 px-4">{invoice.items[0]?.productName || "-"}</td>
                      <td className="py-3 px-4">₹{invoice.items[0] ? formatIndianCurrency(invoice.items[0].unitPrice) : "0.00"}</td>
                      <td className="py-3 px-4 font-medium">₹{formatIndianCurrency(invoice.total)}</td>
                      <td className="py-3 px-4">{invoice._count.items}</td>
                      <td className="py-3 px-4">{invoice.deliveryBy || "-"}</td>
                      <td className="py-3 px-4">{invoice.paymentMode || "-"}</td>
                      <td className="py-3 px-4">
                        <StatusDropdown invoiceId={invoice.id} currentStatus={invoice.paymentStatus} />
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="icon" title="View & Download PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
