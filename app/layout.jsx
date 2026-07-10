import "./globals.css";
import { getSiteData } from "@/lib/site";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import Stage from "@/components/Stage";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Cail Customs — make cool stuff.",
    template: "%s · Cail Customs",
  },
  description:
    "a small crew making a lot of different things — shirts, builds, sound, design. contact-to-buy, made in Lubbock, TX.",
  openGraph: {
    title: "Cail Customs — make cool stuff.",
    description: "shirts, builds, sound, design. made in Lubbock, TX.",
    type: "website",
  },
};

// The nav / ticker / footer are the persistent shell; the routed page renders
// inside <Stage>. Layout fetches site data once (cached) for the shell chrome.
export default async function RootLayout({ children }) {
  const data = await getSiteData();
  const s = data.settings;
  return (
    <html lang="en">
      <body>
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
