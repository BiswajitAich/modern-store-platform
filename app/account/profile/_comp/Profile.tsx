"use client";
import Link from "next/link";
import styles from "./ProfilePage.module.css";
import Image from "next/image";
import { UserData } from "@/app/_lib/types";

interface UserProps {
  userData: UserData;
}

const Profile = ({ userData }: UserProps) => {
  const getInitials = () => {
    const first = userData?.firstName?.[0] || "";
    const last = userData?.lastName?.[0] || "";
    return (first + last).toString().toUpperCase() || "U";
  };
  const stats = userData.role === "user" ? userData._count : null;

  return (
    <div className={styles.profileWrapper}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {userData?.profileImage ? (
            <Image
              height={100}
              width={100}
              src={`/api/image?imageId=${encodeURIComponent(
                userData.profileImage
              )}`}
              alt={`${userData.firstName} ${userData.lastName}`}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitials()}</div>
          )}
        </div>
        <div className={styles.profileHeaderInfo}>
          <h1 className={styles.profileName}>
            {userData?.firstName} {userData?.lastName}
          </h1>
          <p className={styles.profileRole}>
            <span className={`${styles.roleBadge} ${styles[userData.role]}`}>
              {userData.role === "admin" ? "Admin" : "User"}
            </span>
          </p>
        </div>
      </div>

      {/* Profile Content */}
      <div className={styles.profileContent}>
        {/* Personal Information */}
        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Personal Information
          </h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <p>First Name</p>
              <p>{userData?.firstName || "Not provided"}</p>
            </div>
            <div className={styles.infoItem}>
              <p>Last Name</p>
              <p>{userData?.lastName || "Not provided"}</p>
            </div>
            <div className={styles.infoItem}>
              <p>Email Address</p>
              <p>{userData?.email || "Not provided"}</p>
            </div>
            <div className={styles.infoItem}>
              <p>Phone Number</p>
              <p>{userData?.phoneNumber || "Not provided"}</p>
            </div>
            <div className={styles.infoItem}>
              <p>User ID</p>
              <p className={styles.userId}>{userData?.id || userData?.id}</p>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Account Settings
          </h2>
          {userData.role === "user" ? (
            <div className={styles.actionButtons}>
              <Link
                href="/account/profile/edit"
                className={styles.actionButton}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </Link>
              <Link
                href="/auth/forgotPassword"
                className={styles.actionButton}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Change Password
              </Link>
              {/* /account/orders */}
              <Link href="#" className={styles.actionButton}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                My Orders
              </Link>
              <Link href="/account/wishlist" className={styles.actionButton}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Wishlist
              </Link>
            </div>
          ) : (
            <p>Only user can change there account settings.</p>
          )}
        </section>

        {/* Quick Stats */}
        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Activity Overview
          </h2>
          {stats ? (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <h3>{stats?.orders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <h3>{stats?.wishlistItems}</h3>
                  <p>Wishlist Items</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <h3>{stats?.reviews}</h3>
                  <p>Reviews</p>
                </div>
              </div>
            </div>
          ) : (
            <p className={styles.noStats}>No activity data available.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
