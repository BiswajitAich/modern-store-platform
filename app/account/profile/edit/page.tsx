import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import styles from "./_comp/ProfileEditPage.module.css";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { EditUserData } from "@/app/_lib/types";
import ProfileEdit from "./_comp/ProfileEdit";
const ProfileEditPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "user") {
    redirect("/auth");
  }
  let userData: EditUserData | null = null;
  if (session.user.role === "user") {
    const user = await prisma.user.findUnique({
      where: { userId: session.user.id },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profileImage: true,
      },
    });

    userData = user
      ? {
          id: session.user.id,
          ...user,
        }
      : null;
  }
  if (userData === null) {
    redirect("/explore");
  }
  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Edit Profile</h1>
          <p className={styles.headerSubtitle}>
            Update your personal information and profile picture
          </p>
        </div>
        <ProfileEdit userData={userData} />
      </div>
    </div>
  );
};

export default ProfileEditPage;

export const metadata: Metadata = {
  title: "Edit My Profile",
  robots: {
    index: false,
    follow: false,
  },
};
