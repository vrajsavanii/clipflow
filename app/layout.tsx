import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, Outfit, Fira_Code } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Clipflow | AI Short-Form Video Generator & Repurposing Platform",
    template: "%s | Clipflow AI"
  },
  description: "Transform long-form podcasts, webinars, and YouTube videos into high-retention 9:16 vertical shorts for TikTok, Instagram Reels, and YouTube Shorts using AI hook detection, auto-speaker tracking, and animated ASS captions.",
  keywords: [
    "AI video generator",
    "YouTube to Shorts",
    "Video clipping AI",
    "AI caption generator",
    "Short form video editor",
    "TikTok clip generator",
    "Instagram Reels creator",
    "Podcast clipping AI",
    "Video repurposing platform",
    "Virality score AI"
  ],
  authors: [{ name: "Clipflow AI Team" }],
  creator: "Clipflow AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://clipflow-omega.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clipflow-omega.vercel.app",
    title: "Clipflow | Turn Long Videos into Viral 9:16 Shorts in Minutes",
    description: "AI-powered short-form video repurposing for creators, podcasters, and agencies. Extract high-hook clips, auto-crop 9:16, and generate animated captions automatically.",
    siteName: "Clipflow AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clipflow AI Video Repurposing Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Clipflow | AI Short-Form Video Generator",
    description: "Turn hours of video into viral TikToks, Reels, and Shorts instantly with AI hook detection and animated captions.",
    creator: "@clipflow_ai",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased dark ${fontSans.variable} ${fontHeading.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#050505] text-white" suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 17, 22, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 0 30px rgba(0, 229, 255, 0.05), 0 0 10px rgba(153, 69, 255, 0.1)',
            },
            className: 'group',
          }}
          richColors
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
