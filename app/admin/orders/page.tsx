import SectionHeading from "@/app/_components/common/SectionHeading";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import styles from "./_comp/order.module.css"
import { decimalToNumber } from "@/app/_lib/serializer";
const getOrders = async (adminId: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag(`admin-order-page-${adminId}`)
  const order = await prisma.whatsAppOrder.findMany({
    where: {
      adminId,
    },
    take: 20,
    select: {
      orderRef: true,
      variantId: true,
      status: true,
      product: {
        select: {
          name: true,
        },
      },
      id: true,
      createdAt: true,
      quantity: true,
      unitPrice: true,
    }
  });
  return order.map((data) => {
    return {
      id: data.id,
      orderRef: data.orderRef,
      status: data.status,
      quantity: data.quantity,
      createdAt: new Date(data.createdAt).toLocaleDateString(),
      productName: data.product.name,
      variantId: data.variantId,
      unitPrice: decimalToNumber(data.unitPrice),
    }
  })
}
const OrdersPage = async () => {
  const admin = await getAuthenticatedAdmin();
  const orders = await getOrders(admin.id);
  return (
    <div className={styles.wrapper}>
      <SectionHeading
        title="Orders"
        subtitle={`Orders for ${admin.storeSlug}`}
      />

      {orders.length === 0 ? (
        <div className={styles.card}>
          <h2>No Orders Yet</h2>
          <p>Incoming WhatsApp orders will appear here.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className={styles.card}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div className={styles.header}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      opacity: 0.7,
                    }}
                  >
                    Order Ref
                  </p>

                  <strong>#{order.orderRef}</strong>
                </div>

                <span
                  className={`${styles.status} ${styles[order.status.toLowerCase()]
                    }`}
                >
                  {order.status}
                </span>
              </div>

              <div className={styles.infoList}>
                <div>
                  <span>Product</span>
                  <strong>{order.productName}</strong>
                </div>

                <div>
                  <span>Quantity</span>
                  <strong>{order.quantity}</strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>
                    ₹
                    {order.unitPrice != null
                      ? (
                        order.unitPrice * order.quantity
                      ).toLocaleString()
                      : "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>{order.createdAt}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;