import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle2, Clock, Receipt } from "lucide-react";
import Link from "next/link";
import { formatIndianCurrency } from "@/lib/utils";
import { StatusDropdown } from "./components/status-dropdown";
import { InvoiceFilters } from "./components/invoice-filters";
import { Pagination } from "./components/pagination";
import { InvoiceActionButtons } from "./components/invoice-action-buttons";

export default async function InvoicesPage(props: {
  searchParams?: Promise<{ query?: string; page?: string; date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const dateStr = searchParams?.date || "";
  const itemsPerPage = 10;
  
  let invoices: any[] = [];
  let dbError = false;
  let totalInvoicesCount = 0;
  let paidInvoicesCount = 0;
  let pendingInvoicesCount = 0;
  let totalFilteredPages = 0;

  try {
    // 1. Fetch summary stats
    const allInvoices = await db.invoice.findMany({
      select: { paymentStatus: true }
    });
    totalInvoicesCount = allInvoices.length;
    paidInvoicesCount = allInvoices.filter(i => i.paymentStatus === 'Paid').length;
    pendingInvoicesCount = totalInvoicesCount - paidInvoicesCount;

    // 2. Build where clause for filtering
    const where: any = {};
    if (query) {
      where.invoiceNumber = {
        contains: query,
        mode: "insensitive"
      };
    }
    if (dateStr) {
      // Filter by invoiceDate within the specified date
      const startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateStr);
      endDate.setHours(23, 59, 59, 999);
      where.invoiceDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    // 3. Get total count for pagination
    const totalFiltered = await db.invoice.count({ where });
    totalFilteredPages = Math.ceil(totalFiltered / itemsPerPage);

    // 4. Fetch the paginated and filtered invoices
    invoices = await db.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoicesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoicesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoicesCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceFilters />
          
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Invoice ID</th>
                  <th className="py-3 px-4 text-left font-medium">Date & Time</th>
                  <th className="py-3 px-4 text-left font-medium">Total Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-center font-medium w-[100px]">Preview</th>
                  <th className="py-3 px-4 text-center font-medium w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(invoice.createdAt), "hh:mm a")}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">₹{formatIndianCurrency(invoice.total)}</td>
                      <td className="py-3 px-4">
                        <StatusDropdown invoiceId={invoice.id} currentStatus={invoice.paymentStatus} />
                      </td>
                      <InvoiceActionButtons invoiceId={invoice.id} />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalFilteredPages > 1 && (
            <div className="mt-4">
              <Pagination totalPages={totalFilteredPages} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
