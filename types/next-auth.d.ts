import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      storeSlug?: string | undefined;
      // email: string;
      // image?: string;
      // first_name: string;
      // last_name: string;
    };
    // & DefaultSession["user"];
  }
}
