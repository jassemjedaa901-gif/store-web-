import "../src/index.css";
import Navbar from "../src/components/Navbar.jsx";
import Providers from "./providers.jsx";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Store Web",
  description: "Store Web - Boutique en ligne",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Store Web",
    description: "Store Web - Boutique en ligne",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-[url('/bg-store.jpg')] bg-cover bg-fixed bg-center">
        <div className="min-h-screen bg-background/85 backdrop-blur-[1px]">
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}

