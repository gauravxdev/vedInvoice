import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import AppLayout from '@/components/layout/app-layout';
import { ClerkProvider } from '@clerk/nextjs';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Invoice Generator',
  description: 'Manage and generate invoices',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <ClerkProvider>
          <AppLayout>{children}</AppLayout>
        </ClerkProvider>
      </body>
    </html>
  );
}

