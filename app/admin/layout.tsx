import { Metadata } from "next";
// import { Suspense } from "react";
import { Toaster } from "sonner";
// import Loading from "../loading";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" duration={5000} richColors closeButton />
    </>
  );
}
