import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, FileText, CheckCircle, Clock, TrendingUp, AlertCircle, ArrowRight, Truck } from 'lucide-react';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function Dashboard() {
  let dbError = false;
  let totalInvoices = 0;
  let paidInvoices = 0;
  let pendingInvoices = 0;
  let invoices: any[] = [];
  let pendingInvoicesList: any[] = [];
  let revenue = 0;
  let pendingRevenue = 0;

  try {
    [totalInvoices, paidInvoices, pendingInvoices, invoices, pendingInvoicesList] = await Promise.all([
      db.invoice.count(),
      db.invoice.count({ where: { paymentStatus: 'Paid' } }),
      db.invoice.count({ where: { paymentStatus: 'Pending' } }),
      db.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true }
      }),
      db.invoice.findMany({
        where: { paymentStatus: 'Pending' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true }
      })
    ]);

    const totalRevenue = await db.invoice.aggregate({
      where: { paymentStatus: 'Paid' },
      _sum: { total: true }
    });
    
    const pendingAmount = await db.invoice.aggregate({
      where: { paymentStatus: 'Pending' },
      _sum: { total: true }
    });

    revenue = totalRevenue._sum.total || 0;
    pendingRevenue = pendingAmount._sum.total || 0;
  } catch (error) {
    dbError = true;
    console.error("Database connection error:", error);
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      {dbError && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">Database Connection Error</h3>
            <p>
              We could not connect to your database. Please make sure your database server is running and the connection string is correctly configured in your settings.
            </p>
            <p className="mt-2 text-sm opacity-80">
              If you are using Supabase or Neon on a free tier, it might be paused due to inactivity. Please log in to your provider to resume it.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric Cards */}
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-indigo-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{revenue.toFixed(2)}</div>
            <p className="text-xs text-indigo-200 mt-1 flex items-center">
               <TrendingUp className="h-3 w-3 mr-1" /> All-time earnings
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
               Generated invoices
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Invoices</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
               Successfully collected
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-amber-200 bg-amber-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Pending Dues</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">₹{pendingRevenue.toFixed(2)}</div>
            <p className="text-xs text-amber-600/80 mt-1 font-medium">
               From {pendingInvoices} pending invoice{pendingInvoices !== 1 && 's'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-slate-200 flex flex-col">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Invoices</CardTitle>
              <Link href="/invoices" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <CardDescription>The latest invoices created in the system.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 h-full">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
                  <FileText className="h-8 w-8 text-slate-200 mb-2" />
                  No recent invoices found.
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                        {invoice.customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-900">{invoice.customer.name}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {invoice.invoiceNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="text-sm text-slate-500">
                        {format(invoice.invoiceDate, 'MMM dd, yyyy')}
                      </div>
                      <div className="font-semibold text-slate-900 w-24">₹{invoice.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-200 flex flex-col">
          <CardHeader className="border-b border-amber-100 bg-amber-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-amber-900">Pending Invoices</CardTitle>
              <Link href="/invoices" className="text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center">
                Review <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <CardDescription className="text-amber-700/70">Invoices awaiting payment collection.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-amber-100 h-full">
              {pendingInvoicesList.length === 0 ? (
                <div className="p-8 text-center text-sm text-amber-600/70 flex flex-col items-center justify-center h-full">
                  <CheckCircle className="h-8 w-8 text-amber-200 mb-2" />
                  All caught up! No pending invoices.
                </div>
              ) : (
                pendingInvoicesList.map((invoice) => (
                  <div key={invoice.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/80 transition-colors">
                    <div className="flex items-start gap-3">
                       <div className="mt-0.5 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                         <Clock className="h-4 w-4" />
                       </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold leading-none text-amber-950">{invoice.customer.name}</p>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700">Pending</span>
                        </div>
                        <div className="flex items-center text-xs text-amber-700/80 gap-3">
                          <span className="font-mono">{invoice.invoiceNumber}</span>
                          {invoice.deliveryBy && (
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" /> {invoice.deliveryBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center text-right border-t sm:border-0 border-amber-100 pt-2 sm:pt-0 mt-2 sm:mt-0">
                       <div className="font-bold text-amber-900 text-base">₹{invoice.total.toFixed(2)}</div>
                       <div className="text-xs text-amber-700/70 font-medium">
                        Due: {format(invoice.invoiceDate, 'MMM dd, yyyy')}
                      </div>
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
