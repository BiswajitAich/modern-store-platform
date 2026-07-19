import { getServerSession } from "next-auth";
import Profile from "./_comp/Profile";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import styles from "./_comp/ProfilePage.module.css";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { UserData } from "@/app/_lib/types";
import {
    adminProfileQuery,
    userProfileQuery,
} from "@/app/_lib/db/queries/profile.query";
import { cacheLife, cacheTag } from "next/cache";
const getProfileData = async (session: {
    user: {
        id: string;
        role: "user" | "admin";
    };
}) => {
    "use cache";
    cacheLife("hours");
    cacheTag(`peofile-${session.user.role}-${session.user.id}`);
    try {
        let userData: UserData | null = null;
        if (session.user.role === "user") {
            const user = await prisma.user.findUnique({
                where: { userId: session.user.id },
                ...userProfileQuery,
            });
            userData = user
                ? ({
                      role: "user",
                      id: user.userId,
                      ...user,
                  } as UserData)
                : null;
        } else if (session.user.role === "admin") {
            const admin = await prisma.admin.findUnique({
                where: { adminId: session.user.id },
                ...adminProfileQuery,
            });
            userData = admin
                ? ({
                      role: "admin",
                      id: admin.adminId,
                      ...admin,
                  } as UserData)
                : null;
        }
        return userData;
    } catch {
        throw new Error("Error while getting Profile Data!");
    }
};
const ProfilePage = async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/auth");
    }
    const userData = await getProfileData(session);
    if (userData === null) {
        redirect("/auth");
    }
    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <Profile userData={userData} />
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
