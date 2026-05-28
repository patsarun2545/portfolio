import type { Metadata } from "next";
import { Geist, Geist_Mono, Sarabun } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ClientLocaleProvider from "@/components/LocaleProvider";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollProgressBar from "@/components/public/ScrollProgressBar";
import BackToTopButton from "@/components/public/BackToTopButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Patsarun Kathinthong — Full Stack Developer",
  description: "Full Stack Developer specializing in PERN/MERN Stack, RESTful API, Next.js, and scalable web applications.",
  keywords: ["Full Stack Developer", "Next.js", "React", "Node.js", "PostgreSQL", "MongoDB", "TypeScript"],
  authors: [{ name: "Patsarun Kathinthong" }],
  creator: "Patsarun Kathinthong",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://your-domain.com",
    title: "Patsarun Kathinthong — Full Stack Developer",
    description: "Full Stack Developer specializing in PERN/MERN Stack, RESTful API, Next.js, and scalable web applications.",
    siteName: "Patsarun Kathinthong Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Patsarun Kathinthong — Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patsarun Kathinthong — Full Stack Developer",
    description: "Full Stack Developer specializing in PERN/MERN Stack, RESTful API, Next.js, and scalable web applications.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sarabun.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ScrollProgressBar />
        <ClientLocaleProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClientLocaleProvider>
        <Toaster />
        <BackToTopButton />
      </body>
    </html>
  );
}
