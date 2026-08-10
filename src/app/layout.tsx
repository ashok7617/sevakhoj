import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://sevakhoj.com"),
  title: "SevaKhoj — Find trusted care & government support in India",
  description:
    "SevaKhoj (सेवा खोज): find care facilities, government schemes, and support services across India. Not a government service.",
  applicationName: "SevaKhoj",
  openGraph: {
    title: "SevaKhoj — Find trusted care & government support in India",
    description:
      "Find care facilities and government schemes across India — for senior citizens, widows, children, and more. A discovery platform; not a government service.",
    url: "https://sevakhoj.com",
    siteName: "SevaKhoj",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SevaKhoj — Find trusted care & government support in India",
    description:
      "Find care facilities and government schemes across India. A discovery platform; not a government service.",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
