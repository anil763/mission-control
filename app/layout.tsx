"use client";
import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Sidebar from "@/components/Sidebar";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <ConvexProvider client={convex}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">{children}</main>
          </div>
        </ConvexProvider>
      </body>
    </html>
  );
}
