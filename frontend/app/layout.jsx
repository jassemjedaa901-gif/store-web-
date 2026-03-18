import "../src/index.css";
import Navbar from "../src/components/Navbar.jsx";
import Providers from "./providers.jsx";

export const metadata = {
  title: "Store Web",
  description: "Store Web - Boutique en ligne",
  icons: [{ rel: "icon", url: "/logo.svg" }],
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

