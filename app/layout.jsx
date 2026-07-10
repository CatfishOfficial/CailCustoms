import "./globals.css";
import { getSiteData } from "@/lib/site";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import Stage from "@/components/Stage";
import JsonLd from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DEFAULT_SOCIALS = ["https://www.instagram.com/", "https://www.youtube.com/"];

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cail Customs — make cool stuff.",
    template: "%s · Cail Customs",
  },
  description:
    "a small crew making a lot of different things — shirts, circuits, sound, design. contact-to-buy, made in Lubbock, TX.",
  openGraph: {
    title: "Cail Customs — make cool stuff.",
    description: "shirts, circuits, sound, design. made in Lubbock, TX.",
    type: "website",
    siteName: "Cail Customs",
    locale: "en_US",
    images: [{ url: "/logo-full.png", alt: "Cail Customs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cail Customs — make cool stuff.",
    description: "shirts, circuits, sound, design. made in Lubbock, TX.",
    images: ["/logo-full.png"],
  },
};

export default async function RootLayout({ children }) {
  const data = await getSiteData();
  const s = data.settings;

  const phone = s.phone.replace(/\D/g, "");
  const sameAs = [s.instagram, s.youtube].filter(
    (u) => u && !DEFAULT_SOCIALS.includes(u)
  );

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Cail Customs",
    description: s.tagline || s.about,
    email: s.email,
    ...(phone && { telephone: phone.length === 10 ? `+1${phone}` : `+${phone}` }),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lubbock",
      addressRegion: "TX",
      addressCountry: "US",
    },
    url: SITE_URL,
    ...(sameAs.length && { sameAs }),
  };

  return (
    <html lang="en">
      <body>
        <JsonLd data={localBusiness} />
        <CartProvider>
          <div className="cc loaded">
            <Nav settings={s} />
            <Ticker text={s.ticker} />
            <Stage>{children}</Stage>
            <Footer settings={s} categories={data.categories} />
            <CartDrawer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
