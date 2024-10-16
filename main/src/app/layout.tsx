import { Providers } from "./providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MunchLA",
  description: "AI powered restaurant recommendation system",
  icons: {
    icon: [
      {
        url: "/favicons/icons8-fork-and-knife-with-plate-emoji-16.png",
      },
      {
        url: "/favicons/icons8-fork-and-knife-with-plate-emoji-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicons/icons8-fork-and-knife-with-plate-emoji-32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicons/icons8-fork-and-knife-with-plate-emoji-96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
