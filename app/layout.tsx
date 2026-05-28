import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./_components/header/Header";
import Footer from "./_components/footer/Footer";
import AuthProvider from "./providers/AuthProvider";
import { Toaster } from "sonner";
import { Suspense } from "react";
import MaintenancePage from "./_components/MaintenancePage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "COMMYFY Web App",
  description:
    "COMMYFY is a powerful e-commerce platform that empowers businesses to create stunning online stores with ease. With its user-friendly interface and robust features, COMMYFY enables entrepreneurs to showcase their products, manage inventory, and provide seamless shopping experiences for customers.",

  metadataBase: new URL("https://commyfy.com"),

  authors: [{ name: "COMMYFY Team", url: "https://commyfy.com" }],

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "COMMYFY Web App",
    description:
      "COMMYFY is a powerful e-commerce platform that empowers businesses to create stunning online stores with ease.",

    url: "https://commyfy.com",
    siteName: "COMMYFY",

    images: [
      {
        url: "/commyfy.png",
        width: 1200,
        height: 630,
        alt: "COMMYFY Web App",
      },
      {
        url: "/commyfy_64x64.ico",
        width: 64,
        height: 64,
        alt: "COMMYFY Icon",
      },
      {
        url: "/commyfy_32x32.ico",
        width: 32,
        height: 32,
        alt: "COMMYFY Icon",
      },
    ],
  },
};

// const maintenance = process.env.MAINTENANCE_MODE === "true";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // if (maintenance) {
  //   return (
  //     <html lang="en">
  //       <body className={`${geistSans.variable} ${geistMono.variable}`}>
  //         <MaintenancePage />;
  //       </body>
  //     </html>
  //   );
  // }
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: "10dvh",
                  maxHeight: "10dvh",
                  minWidth: "100%",
                  backgroundColor: "black",
                }}
              />
            }
          >
            <Header />
          </Suspense>
          <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
            {children}
          </Suspense>
        </AuthProvider>
        <Toaster position="top-right" duration={5000} richColors closeButton />
        <Footer />
      </body>
    </html>
  );
}
