"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const isAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return false;
  }
  return session?.user?.role === "user";
};

export const isAuthenticatedAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return false;
  }
  return session?.user?.role === "admin";
};

export const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);
  
  if (!session || session.user.role!=="user") {
    console.error("Unauthorized");
    return {
      id: "",
      role: "",
    };
  }

  return session.user;
};
export const getAuthenticatedAdmin = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);
  
  if (!session || session.user.role!=="admin") {
    console.error("Unauthorized");
    return {
      id: "",
      role: "",
      storeSlug: ""
    };
  }

  return session.user;
};