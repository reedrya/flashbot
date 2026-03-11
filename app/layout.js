import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProviderClient from "@/components/ThemeProviderClient";
import clerkAppearance from "@/components/clerkAppearance";

const inter = Inter({ subsets: ["latin"] });
const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata = {
  title: {
    default: "FlashBot",
    template: "%s | FlashBot",
  },
  description: "AI-powered flashcard generation for turning notes and source material into clean, study-ready review sets.",
};

export default function RootLayout({ children }) {
  const content = (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProviderClient>{children}</ThemeProviderClient>
      </body>
    </html>
  );

  if (!isClerkConfigured) {
    return content;
  }

  return (
    <ClerkProvider appearance={clerkAppearance} afterSignOutUrl="/">
      {content}
    </ClerkProvider>
  );
}
