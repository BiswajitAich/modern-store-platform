import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/app/_lib/customForServerSide";
import { addConnection, removeConnection } from "@/app/_lib/notificationConnections";

export const GET = async () => {
  const admin = await getAuthenticatedUser();

  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let controller: any;
  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      addConnection(admin.id, controller);

      // optional initial message
      controller.enqueue(`data: ${JSON.stringify({ connected: true })}\n\n`);
    },

    cancel() {
      removeConnection(admin.id, controller);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};
