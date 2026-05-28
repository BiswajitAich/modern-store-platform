import { getServerSession } from "next-auth";
import Profile from "./_comp/Profile";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import styles from "./_comp/ProfilePage.module.css";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { UserData } from "@/app/_lib/types";
import { Suspense } from "react";
import Loading from "@/app/loading";
const ProfilePage = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth");
  }
  let userData: UserData | null = null;
  if (session.user.role === "user") {
    const user = await prisma.user.findUnique({
      where: { userId: session.user.id },
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
    });
    userData = user
      ? ({
          role: session.user.role,
          id: session.user.id,
          ...user,
        } as UserData)
      : null;
  } else if (session.user.role === "admin") {
    const admin = await prisma.admin.findUnique({
      where: { adminId: session.user.id },
      select: {
        adminId: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        profileImage: true,
        createdAt: true,
      },
    });
    userData = admin
      ? ({
          role: session.user.role,
          id: session.user.id,
          ...admin,
        } as UserData)
      : null;
  }
  if (userData === null) {
    redirect("/auth");
  }
  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <Suspense fallback={<Loading />}>
          <Profile userData={userData} />
        </Suspense>
      </div>
    </div>
  );
};

export default ProfilePage;

export const metadata: Metadata = {
  title: "My Profile",
  robots: {
    index: false,
    follow: false,
  },
};
