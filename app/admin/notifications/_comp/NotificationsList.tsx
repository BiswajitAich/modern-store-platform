"use client";

import { useRouter, useSearchParams } from "next/navigation";

const NotificationsList = ({
  notifications,
  nextCursor,
}: {
  notifications: any;
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

  return (
    <div style={{ minHeight: '50dvh', maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Notifications</h2>
      {notifications.length === 0 ? (
        <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>No new notifications</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              style={{
                padding: 12,
                borderRadius: 8,
                background: 'var(--bg-tertiary)',
                boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
                border: '1px solid rgba(16,24,40,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{notification.message}</p>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {nextCursor && (
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            onClick={loadMore}
            style={{
              background: '#111827',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
