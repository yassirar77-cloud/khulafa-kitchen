import "./globals.css";
export const metadata = { title: "Khulafa Kitchen", manifest: "/manifest.json" };
export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
