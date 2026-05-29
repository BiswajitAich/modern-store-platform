import type { Prisma } from "@/app/generated/prisma/client";

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

// export type CategoryOption = {
//   id: number;
//   name: string;
// };


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

// export interface ProductPageDB {
//   id: number;
//   name: string;
//   updatedAt: Date;
//   _count: {
//     reviews: number;
//   };
//   description: string | null;
//   brand: string | null;
//   attributes: {
//     id: number;
//     key: string;
//     value: string;
//   }[];
//   variants: {
//     id: number;
//     updatedAt: Date;
//     images: {
//       image: string;
//     }[];
//     productId: number;
//     price: Decimal;
//     stock: number;
//     sku: string | null;
//     options: {
//       id: number;
//       key: string;
//       value: string;
//     }[];
//     originalPrice: Decimal | null;
//     optionHash: string;
//   }[];
// }

// export interface ProductPageSerialized {
//   id: number;
//   name: string;
//   description: string | null;
//   brand: string | null;
//   updatedAt: string;

//   attributes: {
//     id: number;
//     key: string;
//     value: string;
//   }[];

//   variants: {
//     id: number;
//     productId: number;
//     price: number | null;
//     originalPrice: number | null;
//     stock: number;
//     sku: string | null;
//     optionHash: string;
//     updatedAt: string;

//     images: string[];

//     options: {
//       id: number;
//       key: string;
//       value: string;
//     }[];
//   }[];

//   _count: {
//     reviews: number;
//   };
// }

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
  | ({
    role: "user";
    id: string;
  } & Prisma.UserGetPayload<{
    select: {
      userId: true;
      firstName: true;
      lastName: true;
      phoneNumber: true;
      email: true;
      profileImage: true;
      isVerified: true;
      createdAt: true;
      _count: {
        select: {
          orders: true;
          wishlistItems: true;
          reviews: true;
        };
      };
    };
  }>)
  | ({
    role: "admin";
    id: string;
  } & Prisma.AdminGetPayload<{
    select: {
      adminId: true;
      firstName: true;
      lastName: true;
      phoneNumber: true;
      email: true;
      profileImage: true;
      createdAt: true;
    };
  }>);

export type EditUserData = Omit<
  UserData,
  "role" | "_count" | "createdAt" | "isVerified" | "email"
>;

// export interface ProductCardDTO {
//   id: number;
//   name: string;
//   slug: string;
//   storeSlug: string;
//   // isLiked: boolean;
//   variant: {
//     id?: number;
//     optionHash?: string;
//     price: number | null;
//     originalPrice: number | null;
//     image: string | null;
//     options?: {
//       key: string;
//       value: string;
//     }[];
//   };
// }

// export interface ProductCardDTOWithLike extends ProductCardDTO {
//   isLiked?: boolean;
// }

// notifications types

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
