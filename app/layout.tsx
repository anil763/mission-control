"use client";
import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Sidebar from "@/components/Sidebar";

const convexUrl = (process.env.NEXT_PUBLIC_CONVEX_URL ?? "").trim();
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {convex ? (
          <ConvexProvider client={convex}>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">{children}</main>
            </div>
          </ConvexProvider>
        ) : (
          <div className="p-6 text-sm text-red-300">Mission Control misconfigured: missing NEXT_PUBLIC_CONVEX_URL</div>
        )}
      </body>
    </html>
  );
}
