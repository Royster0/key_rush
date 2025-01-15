import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "../components/theme-provider";
import Nav from "@/components/Nav";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Key Rush",
  description: "Test yourself by typing as quickly and accurrately as you can!",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await getUser();

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Nav user={user} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
