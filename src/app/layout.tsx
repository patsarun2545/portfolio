import type { Metadata } from "next";
import { Geist, Geist_Mono, Sarabun } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ClientLocaleProvider from "@/components/LocaleProvider";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollProgressBar from "@/components/public/ScrollProgressBar";
import BackToTopButton from "@/components/public/BackToTopButton";
import WebVitals from "@/components/WebVitals";

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
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "Patsarun Kathinthong — Full Stack Developer",
  description: "Full Stack Developer | React, Next.js, Node.js, PostgreSQL. Specializing in PERN/MERN Stack, RESTful API, and scalable web applications.",
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
      <head>
        <Script
          id="json-ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Patsarun Kathinthong",
              jobTitle: "Full Stack Developer",
              email: "patsarun2545@gmail.com",
              url: "https://github.com/patsarun2545",
              sameAs: [
                "https://github.com/patsarun2545",
                "https://linkedin.com/in/patsarun-kathinthong",
              ],
              knowsAbout: [
                "React",
                "Next.js",
                "Node.js",
                "PostgreSQL",
                "MongoDB",
                "TypeScript",
                "RESTful API",
                "GraphQL",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <WebVitals />
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
