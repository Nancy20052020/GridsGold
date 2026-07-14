import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./lib/store";
import { readSupabaseEnv } from "./lib/supabase";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Grids Gold Jewellery ERP",
  description: "Responsive frontend for Grids Gold Jewellery ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read on the server so values reach the client even when Turbopack does not
  // inline NEXT_PUBLIC_* into the browser bundle.
  const supabase = readSupabaseEnv();

  return (
    <html lang="en" className={playfair.variable}>
      <body className={inter.className}>
        <StoreProvider
          supabaseUrl={supabase?.url ?? ""}
          supabaseAnonKey={supabase?.anonKey ?? ""}
        >
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
