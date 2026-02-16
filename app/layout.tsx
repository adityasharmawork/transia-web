import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { CircuitPulseBackground } from "./components/shared/circuit-pulse-background";
import "./globals.css";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerkKey = clerkKey.startsWith("pk_") && clerkKey.length > 20;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transia — Ship Your Product to Every Market",
  description:
    "Turn your React app into a global product with one command. Reach 8 billion people without rebuilding your codebase.",
  keywords: [
    "i18n",
    "translation",
    "AI",
    "CLI",
    "React",
    "Next.js",
    "localization",
    "internationalization",
    "global growth",
  ],
  openGraph: {
    title: "Transia — Ship Your Product to Every Market",
    description:
      "Turn your React app into a global product with one command. AI-powered. Your keys. Your control.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grain-overlay`}
      >
        <CircuitPulseBackground />
        {children}
      </body>
    </html>
  );

  if (!hasClerkKey) return content;
  return <ClerkProvider>{content}</ClerkProvider>;
}
