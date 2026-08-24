import { getProducts } from "@/app/actions/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, IndianRupee } from "lucide-react";
import { AddProductDialog } from "./components/add-product-dialog";
import { ProductTable } from "./components/product-table";
import { formatIndianCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const result = await getProducts();
  const products = result.data || [];
  const dbError = !result.success && products.length === 0;

  const totalProducts = products.length;
  const productsWithSize = products.filter(p => !!p.size).length;
  const avgPrice = totalProducts > 0 
    ? products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / totalProducts 
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Catalogue</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your standard products, sizes, and suggested rates for fast invoice generation.
          </p>
        </div>
        <AddProductDialog />
      </div>

      {dbError && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <h3 className="font-bold text-base mb-1">Database Connection Error</h3>
          <p className="text-sm">
            We could not connect to your database. Please ensure your database server is running.
          </p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Available in invoice selector</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products with Size</CardTitle>
            <Tag className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsWithSize}</div>
            <p className="text-xs text-muted-foreground mt-1">Formats as Name (Size)</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Default Rate</CardTitle>
            <IndianRupee className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{formatIndianCurrency(avgPrice)}</div>
            <p className="text-xs text-muted-foreground mt-1">Customizable per customer</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Catalogue Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
