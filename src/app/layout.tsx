import type { Metadata, Viewport } from "next";
import { Poppins, PT_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SessionProvider } from "@/context/SessionContext";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";

// Safeguard for Node.js 25+ where an experimental, incomplete global `localStorage` is defined on the server side
if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
  try {
    const localstorage = (globalThis as any).localStorage;
    if (!localstorage || typeof localstorage.getItem !== 'function') {
      delete (globalThis as any).localStorage;
    }
  } catch (e) {
    // Silently ignore deletion failures
  }
}


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

export const metadata: Metadata = {
  title: "UniVault",
  description: "A student learning & grade-management platform.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#030a16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${ptSans.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <FirebaseClientProvider>
              <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-obsidian-mesh text-slate-900 dark:text-slate-100 transition-colors duration-300">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </FirebaseClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
