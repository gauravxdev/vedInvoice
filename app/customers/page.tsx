import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function CustomersPage() {
  let customers: any[] = [];
  let dbError = false;

  try {
    customers = await db.customer.findMany({
      include: {
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    dbError = true;
    console.error("Database connection error:", error);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>

      {dbError && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Database Connection Error</h3>
          <p>We could not connect to your database. Please make sure your database server is running.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Name</th>
                  <th className="py-3 px-4 text-left font-medium">Total Orders</th>
                  <th className="py-3 px-4 text-left font-medium">Total Revenue</th>
                  <th className="py-3 px-4 text-left font-medium">Last Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const totalRevenue = customer.invoices?.reduce((sum: number, inv: any) => sum + inv.total, 0) || 0;
                    const sortedInvoices = [...(customer.invoices || [])].sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
                    const lastInvoice = sortedInvoices[0];

                    return (
                      <tr key={customer.id}>
                        <td className="py-3 px-4 font-medium">{customer.name}</td>
                        <td className="py-3 px-4">{customer.invoices.length}</td>
                        <td className="py-3 px-4">₹{totalRevenue.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          {lastInvoice ? format(lastInvoice.createdAt, "MMM dd, yyyy") : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
