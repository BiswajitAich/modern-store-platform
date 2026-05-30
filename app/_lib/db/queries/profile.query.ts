import { Prisma } from "@/app/generated/prisma/client";

export const userProfileQuery = {
  select: {
    userId: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    email: true,
    profileImage: true,
    isVerified: true,
    createdAt: true,
    _count: {
      select: {
        orders: true,
        wishlistItems: true,
        reviews: true,
      },
    },
  },
} satisfies Prisma.UserDefaultArgs;

export type UserProfile = Prisma.UserGetPayload<
  typeof userProfileQuery
>;
export const adminProfileQuery = {
  select: {
    adminId: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    email: true,
    profileImage: true,
    createdAt: true,
  },
} satisfies Prisma.AdminDefaultArgs;

export type AdminProfile = Prisma.AdminGetPayload<
  typeof adminProfileQuery
>;