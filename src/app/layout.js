import "./globals.css";
import Header from "@/components/header/Header";

export const metadata = {
  title: "Rotomech",
  description: "Rotomech",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
