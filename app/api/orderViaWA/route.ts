import prisma from "@/lib/prisma";
import {
  getAuthenticatedUser,
  isAuthenticatedUser,
} from "@/app/_lib/customForServerSide";

export async function POST(request: Request) {
  const { variantId, quantity, productPath } = await request.json();

  if (!variantId || quantity <= 0) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: { include: { admin: true } },
    },
  });
  if (!variant) {
    return Response.json({ error: "Variant not found" }, { status: 404 });
  }
  if (variant.price == null) {
    return Response.json({ error: "Invalid variant price" }, { status: 400 });
  }
  if (quantity > variant.stock) {
    return Response.json(
      { error: "Requested quantity exceeds available stock" },
      { status: 400 },
    );
  }
  if (!variant.product.admin.phoneNumber) {
    return Response.json(
      { error: "Seller contact unavailable" },
      { status: 500 },
    );
  }
  const userId = (await getAuthenticatedUser())?.id;
  if (!(await isAuthenticatedUser())) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const orderRef = crypto.randomUUID();

  try {
    const order = await prisma.whatsAppOrder.create({
      data: {
        orderRef,
        userId,
        adminId: variant.product.adminId,
        productId: variant.productId,
        variantId: variant.id,
        quantity,
        unitPrice: variant.price,
        status: "INITIATED",
        message: `Order for ${variant.product.name} (Variant ID: ${variant.id})`,
      },
    });
    await prisma.adminNotification.create({
      data: {
        adminId: variant.product.adminId,
        type: "NEW_ORDER",
        entityId: order.id,
        message: `New order received for ${variant.product.name} (Variant ID: ${variant.id}).`,
      },
    });
  } catch (error) {
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
  const whatsappMessage = encodeURIComponent(
    `🛒 *New Order Request*

*Product:* Hello World
*Quantity:* ${quantity}
*Unit Price:* Rs ${variant.price}
*Total:* Rs ${Number(variant.price ?? 0) * quantity}

🔗 *Product Link:*
${productPath}

📃 *Order Ref:*  ${orderRef}`,
  );

  return Response.json(
    {
      whatsappWebUrl: `whatsapp://send?phone=${variant.product.admin.phoneNumber}&text=${whatsappMessage}`,
      whatsappAppUrl: `https://wa.me/${variant.product.admin.phoneNumber}?text=${whatsappMessage}`,
    },
    { status: 201 },
  );
}
