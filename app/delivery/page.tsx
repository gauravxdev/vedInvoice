import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { AddPartnerDialog } from "./components/add-partner-dialog";
import { auth } from "@clerk/nextjs/server";

export default async function DeliveryPage() {
  const { userId } = await auth();
  const userFilter = userId ? { userId } : { userId: "__anonymous__" };

  let deliveryPartners: any[] = [];
  let dbError = false;

  try {
    const [invoices, settings] = await Promise.all([
      db.invoice.findMany({
        where: userFilter,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      db.companySettings.findFirst({
        where: userFilter,
      })
    ]);

    const deliveryMap = new Map<string, { totalOrders: number, totalRevenue: number, lastInvoice: Date | null }>();

    // 1. Initialize map with all delivery partners from settings
    if (settings?.deliveryPartners) {
      const partnersList = settings.deliveryPartners.split(",").filter(Boolean);
      partnersList.forEach(partner => {
        deliveryMap.set(partner.trim(), {
          totalOrders: 0,
          totalRevenue: 0,
          lastInvoice: null
        });
      });
    }

    // 2. Iterate over invoices to update stats
    invoices.forEach(inv => {
      // Find the delivery partner from invoice level or fallback to first item
      const partner = inv.deliveryBy || inv.items[0]?.deliveryBy;
      if (!partner) return; // Skip if no delivery partner assigned
      
      const partnerName = partner.trim();
      const existing = deliveryMap.get(partnerName);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalRevenue += inv.total;
        if (!existing.lastInvoice || inv.createdAt > existing.lastInvoice) {
          existing.lastInvoice = inv.createdAt;
        }
      } else {
        // Fallback for legacy partners not in settings
        deliveryMap.set(partnerName, {
          totalOrders: 1,
          totalRevenue: inv.total,
          lastInvoice: inv.createdAt
        });
      }
    });

    deliveryPartners = Array.from(deliveryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        // Sort by total orders first, then alphabetically
        if (b.totalOrders !== a.totalOrders) {
          return b.totalOrders - a.totalOrders;
        }
        return a.name.localeCompare(b.name);
      });

  } catch (error) {
    dbError = true;
    console.error("Database connection error:", error);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Delivery Partners</h2>
        <AddPartnerDialog />
      </div>

      {dbError && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Database Connection Error</h3>
          <p>We could not connect to your database. Please make sure your database server is running.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Delivery Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Name</th>
                  <th className="py-3 px-4 text-left font-medium">Total Deliveries</th>
                  <th className="py-3 px-4 text-left font-medium">Total Revenue</th>
                  <th className="py-3 px-4 text-left font-medium">Last Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deliveryPartners.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No delivery partners found.
                    </td>
                  </tr>
                ) : (
                  deliveryPartners.map((partner) => (
                    <tr key={partner.name}>
                      <td className="py-3 px-4 font-medium">{partner.name}</td>
                      <td className="py-3 px-4">{partner.totalOrders}</td>
                      <td className="py-3 px-4">₹{partner.totalRevenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {partner.lastInvoice 
                          ? <span className="text-foreground">{format(partner.lastInvoice, "MMM dd, yyyy")}</span>
                          : "No deliveries yet"}
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
