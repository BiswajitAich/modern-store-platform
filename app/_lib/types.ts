import type { Prisma } from "@/app/generated/prisma/client";
import { UserProfile, AdminProfile } from "./db/queries/profile.query";

export interface ErrorFormState {
  error: string | null | undefined;
  timestamp: string;
}

export type CategoryEdit = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  description: string | null;
  parent?: {
    id: number;
    name: string;
  } | null;
  _count?: {
    products: number;
  };
};

export type CategoryPageDB = Prisma.CategoryGetPayload<{
  select: {
    name: true;
    products: {
      where: {
        isActive: true;
        variants: { some: { stock: { gt: 0 } } };
      };
      orderBy: { sortOrder: "asc" };
      select: {
        id: true;
        name: true;
        slug: true;
        variants: {
          where: { stock: { gt: 0 } };
          orderBy: { price: "asc" };
          take: 1;
          select: {
            price: true;
            images: {
              orderBy: { sortOrder: "asc" };
              take: 1;
              select: { image: true };
            };
          };
        };
      };
    };
  };
}>;

export type CategoryPage = Omit<CategoryPageDB, "products"> & {
  products: {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string;
  }[];
};


type ProductWithVariantRaw = Prisma.ProductGetPayload<{
  include: {
    variants: {
      where: { stock: { gt: 0 } };
      orderBy: { price: "asc" };
      take: 1;
      select: {
        price: true;
        originalPrice: true;
        images: {
          orderBy: { sortOrder: "asc" };
          take: 1;
          select: { image: true };
        };
      };
    };
  };
}>;
export type ProductStorepageProp = Omit<ProductWithVariantRaw, "variants"> & {
  variants: {
    price: number;
    originalPrice: number | null;
    images: { image: string }[];
  }[];
};

export type UserData =
  | ({ role: "user"; id: string } & UserProfile)
  | ({ role: "admin"; id: string } & AdminProfile);

export type EditUserData = Omit<
  UserData,
  "role" | "_count" | "createdAt" | "isVerified" | "email"
>;


export interface Notification {
  createdAt: Date;
  id: number;
  message: string;
  type: string;
}
export interface FetchNotificationsResponse {
  hasNew: boolean;
  notification: Notification[] | null;
}
