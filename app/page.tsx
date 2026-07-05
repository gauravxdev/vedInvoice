import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, FileText, CheckCircle, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { format } from 'date-fns';

export default async function Dashboard() {
  let dbError = false;
  let totalInvoices = 0;
  let paidInvoices = 0;
  let pendingInvoices = 0;
  let invoices: any[] = [];
  let revenue = 0;

  try {
    [totalInvoices, paidInvoices, pendingInvoices, invoices] = await Promise.all([
      db.invoice.count(),
      db.invoice.count({ where: { paymentStatus: 'Paid' } }),
      db.invoice.count({ where: { paymentStatus: 'Pending' } }),
      db.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true }
      })
    ]);

    const totalRevenue = await db.invoice.aggregate({
      where: { paymentStatus: 'Paid' },
      _sum: { total: true }
    });

    revenue = totalRevenue._sum.total || 0;
  } catch (error) {
    dbError = true;
    console.error("Database connection error:", error);
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h2>

      {dbError && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Database Connection Error</h3>
          <p>
            We could not connect to your database. Please make sure your database server is running and the connection string is correctly configured in your settings.
          </p>
          <p className="mt-2 text-sm opacity-80">
            If you are using Supabase or Neon on a free tier, it might be paused due to inactivity. Please log in to your provider to resume it.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent invoices.</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{invoice.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {format(invoice.invoiceDate, 'MMM dd, yyyy')}
                      </div>
                      <div className="font-medium">₹{invoice.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
