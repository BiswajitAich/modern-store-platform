"use client";
import styles from "./notification.module.css";
import SectionHeading from "@/app/_components/common/SectionHeading";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
type NotificationType =
  | "ORDER_INITIATED"
  | "ORDER_CANCELLED"
  | "ORDER_CONFIRMED"
  | "REVIEW_CREATED";
interface NotificationList {
  id: number;
  type: NotificationType;
  message: string;
  createdAt: Date;
  adminId: string;
  entityId: number | null;
  isRead: boolean;
}
const NotificationsList = ({
  notifications,
  nextCursor,
}: {
  notifications: NotificationList[];
  nextCursor: number | null | undefined;
}) => {
  console.log(notifications);
  const router = useRouter();
  const params = useSearchParams();

  const loadMore = () => {
    if (!nextCursor) return;
    const newParams = new URLSearchParams(params);
    newParams.set("next", nextCursor.toString());

    router.push(`?${newParams.toString()}`);
  };

  const getNotificationLink = (notification: NotificationList) => {
    if (!notification.entityId) {
      return "/admin/notifications";
    }

    switch (notification.type) {
      case "ORDER_INITIATED":
      case "ORDER_CANCELLED":
      case "ORDER_CONFIRMED":
        return `/admin/orders/${notification.entityId}`;

      case "REVIEW_CREATED":
        return `/admin/reviews/${notification.entityId}`;

      default:
        return "/admin/notifications";
    }
  };

  return (
    <div className={styles.container}>
      <SectionHeading title="Notification" subtitle="all admin notifications" />
      {notifications.length === 0 ? (
        <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>No new notifications</div>
      ) : (
        <div className={styles.notificationWrapper}>
          {notifications.map((notification: NotificationList) => (
            <Link
              href={getNotificationLink(notification)}
              key={notification.id}
              className={styles.notificationCard}
            >
              <div className={styles.notificationCardDiv}>
                <p className={styles.notificationCardP}>{notification.message}</p>
                <span className={styles.notificationCardSpan}>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className={styles.loadMoreBtnContainer}>
          <button
            onClick={loadMore}
            className={styles.loadMoreBtn}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
