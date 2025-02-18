import type { Metadata } from "next";

import "./globals.css";
import ContextProvider from "@/providers/ContextProvider";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "JobSphere",
  description: "Create a job finder application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased`}>
        <Toaster position="top-center" />
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
