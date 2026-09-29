import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import InvoiceViewer from "./components/invoice-viewer";
import { auth } from "@clerk/nextjs/server";

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const resolvedParams = await params;
  const invoice = await db.invoice.findFirst({
    where: { id: resolvedParams.id, userId },
    include: {
      customer: true,
      items: true,
    }
  });

  if (!invoice) {
    notFound();
  }

  const companySettings = await db.companySettings.findFirst({ where: { userId } }) || {
    companyName: "Your Company",
    email: "",
    phone: "",
    companyAddress: "",
    gstNumber: ""
  };

  return (
    <div className="p-4 md:p-8 h-full bg-neutral-50 overflow-x-auto">
      <InvoiceViewer invoice={invoice} companySettings={companySettings} />
    </div>
  );
}
