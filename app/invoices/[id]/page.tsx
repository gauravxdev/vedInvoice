import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import InvoiceViewer from "./components/invoice-viewer";

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const invoice = await db.invoice.findUnique({
    where: { id: resolvedParams.id },
    include: {
      customer: true,
      items: true,
    }
  });

  if (!invoice) {
    notFound();
  }

  // We should ideally fetch the company settings too
  const companySettings = await db.companySettings.findFirst() || {
    companyName: "Your Company",
    email: "",
    phone: "",
    companyAddress: "",
    gstNumber: ""
  };

  return (
    <div className="p-8 h-full bg-neutral-50 flex justify-center">
      <InvoiceViewer invoice={invoice} companySettings={companySettings} />
    </div>
  );
}
