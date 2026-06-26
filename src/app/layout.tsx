import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import AiAssistant from "@/components/AiAssistant";
import HashScroll from "@/components/HashScroll";
import ModalHost from "@/components/modals/ModalHost";
import SiteNav from "@/components/SiteNav";
import { BookingProvider } from "@/components/BookingProvider";
import { UiShellProvider } from "@/components/UiShellProvider";
import StructuredData from "@/components/StructuredData";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PortfolioEmbedProvider } from "@/components/PortfolioEmbedProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURA HAIR SPACE · Dempsey Hill, Singapore",
  description:
    "Premium hair salon in Dempsey Hill, Singapore. Japanese precision, modern luxury. By appointment only.",
  openGraph: {
    title: "AURA HAIR SPACE",
    description:
      "Private hair atelier in Dempsey Hill — precision colour, ritual care, by appointment.",
    locale: "en_SG",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0908" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aura-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.setAttribute('data-theme',window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${cormorant.variable} ${inter.variable} font-sans`}>
        <StructuredData />
        <ThemeProvider>
          <PortfolioEmbedProvider>
            <UiShellProvider>
              <BookingProvider>
                <SiteNav />
                <HashScroll />
                {children}
                <ModalHost />
                <AiAssistant />
              </BookingProvider>
            </UiShellProvider>
          </PortfolioEmbedProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
