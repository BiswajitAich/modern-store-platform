"use server";
type Controller = ReadableStreamDefaultController<string>;

const adminConnections = new Map<string, Set<Controller>>();

export async function addConnection(adminId: string, controller: Controller) {
  if (!adminConnections.has(adminId)) {
    adminConnections.set(adminId, new Set());
  }

  adminConnections.get(adminId)!.add(controller);
}

export async function removeConnection(adminId: string, controller: Controller) {
  adminConnections.get(adminId)?.delete(controller);

  if (adminConnections.get(adminId)?.size === 0) {
    adminConnections.delete(adminId);
  }
}

export async function pushToAdmin(adminId: string, data: unknown) {
  const controllers = adminConnections.get(adminId);

  if (!controllers) return;

  const payload = `data: ${JSON.stringify(data)}\n\n`;

  for (const controller of controllers) {
    try {
      controller.enqueue(payload);
    } catch {
      controllers.delete(controller);
    }
  }
}
