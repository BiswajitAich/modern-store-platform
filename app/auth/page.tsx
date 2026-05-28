import type { Metadata } from "next";
import AuthComponent from "./_comp/AuthComponent";
import { Suspense } from "react";
import Loading from "../loading";
const Authentication = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AuthComponent />
    </Suspense>
  );
};

export default Authentication;
export function getErrorMessage(code: string) {
  switch (code) {
    case "CredentialsSignin":
      return "Invalid email or password.";
    case "OAuthAccountNotLinked":
      return "This email is already registered using another login method.";
    case "AccessDenied":
      return "You do not have permission to access this account.";
    case "Configuration":
      return "Server configuration error.";
    default:
      return "Something went wrong. Please try again.";
  }
}

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
