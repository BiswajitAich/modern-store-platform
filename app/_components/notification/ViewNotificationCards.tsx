"use client";
import NotificationDot from "./NotificationDot";
import styles from "./DropdownNotificationCards.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Notification } from "@/app/_lib/types";

const ViewNotificationCards = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [isNewNotification, setIsNewNotification] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayDropdown, setDisplayDropdown] = useState(false);
  useEffect(() => {
    if (!isLoggedIn) {
      setIsNewNotification(false);
      setNotifications([]);
      return;
    }
    const sse = new EventSource("/api/notifications/stream");
    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setIsNewNotification(!!data.hasNew);
      setNotifications(data.notification ?? []);
    };
    sse.onerror = () => {
      console.error("SSE connection error");
      sse.close();
    };
    return () => {
      sse.close();
    };
  }, [isLoggedIn]);

  return (
    <div
      className={`${styles.dropdownContainer} ${displayDropdown ? styles.dropdownContainerHover : ""}`}
    >
      <button
        className={styles.iconButton}
        onClick={() => setDisplayDropdown((prev) => !prev)}
        onMouseEnter={() => setDisplayDropdown(true)}
        onMouseLeave={() => setDisplayDropdown(false)}
      >
        🔔
        {isNewNotification && <NotificationDot />}
        {!isLoggedIn && <NotificationDot />}
      </button>
      {/* Dropdown content */}
      {(notifications?.length ?? 0) === 0 ? (
        <>
          {!isLoggedIn ? (
            <div className={styles.dropdown}>
              <p className={styles.noNotifications}>Welcome !</p>
              <hr className={styles.dropdownDivider} />
              <Link
                href={"/auth?mode=signin"}
                className={styles.noNotifications}
              >
                Login as user...
              </Link>
              <hr className={styles.dropdownDivider} />
              <Link
                href={"/auth?mode=signup"}
                className={styles.noNotifications}
              >
                New ? Create account ...
              </Link>
            </div>
          ) : (
            <div className={styles.dropdown}>
              <p className={styles.noNotifications}>No new notifications</p>
              <hr className={styles.dropdownDivider} />
              <Link href="/admin/notifications" className={styles.dropdownItem}>
                View All Notifications
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className={styles.dropdown}>
          {notifications.map((n: Notification) => (
            <div key={n.id}>
              <Link href="#" className={styles.dropdownItem}>
                {n.message}
              </Link>
              <hr className={styles.dropdownDivider} />
              <Link href="/admin/notifications" className={styles.dropdownItem}>
                View All Notifications
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewNotificationCards;
