import type { Metadata } from "next";
import AuthComponent from "./_comp/AuthComponent";
const Authentication = () => {
  return (
      <AuthComponent />
  );
};

export default Authentication;

export const metadata: Metadata = {
  title: "Commyfy - Authentication",
  description:
    "Access your account securely. Signin(login) / Signup to manage your orders, wishlist, and profile.",
  openGraph: {
    title: "Commyfy - Authentication",
    description: "Secure login to your YourStore account.",
    url: `https://commyfy.vercel.app/auth`,
    type: "website",
  },
};
