import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import prisma from "@/lib/prisma";
import NotificationsList from "./_comp/NotificationsList";
import { cacheLife, cacheTag } from "next/cache";

const getNotifications = async (
  adminId: string,
  cursor?: string,
  limit = 20,
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag(`get-notification-${adminId}`);

  const res = await prisma.adminNotification.findMany({
    where: {
      adminId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: Number(cursor) },
      skip: 1,
    }),
  });

  let nextCursor = null;

  if (res.length > limit) {
    const nextItem = res.pop();
    nextCursor = nextItem?.id;
  }

  return {
    notifications: res,
    nextCursor,
  };
};

const Notifications = async ({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[] | undefined;
    limit?: string | string[] | undefined;
  }>;
}) => {
  const searchParamsResolved = await searchParams;
  const { next, limit } = searchParamsResolved;
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  const { notifications, nextCursor } = await getNotifications(
    admin.id,
    next as string,
    limit ? parseInt(limit as string) : 20,
  );
  return (
    <div>
      <NotificationsList
        notifications={notifications}
        nextCursor={nextCursor}
      />
    </div>
  );
};

export default Notifications;
