import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import { Home } from "lucide-react";

export const metadata: Metadata = {
  title: "DontForget",
  description: "Track school assignment deadlines — never miss a due date.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen`}>
        {children}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-2">
          <a
            href="https://jesseverse.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Back to Jesseverse"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:shadow-md hover:text-foreground"
          >
            <Home size={18} />
          </a>
          <ThemeToggle />
        </div>
      </body>
    </html>
  );
}
