import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MHS | Hospital portal", template: "%s | MHS" },
  description: "Multiplatform Hospital System account portal.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a
          className="fixed -top-25 left-4 z-100 bg-white p-2 text-[#163f73] focus:top-4"
          href="#contenido"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
