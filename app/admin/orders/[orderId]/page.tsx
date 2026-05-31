import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import styles from "../_comp/order.module.css";
import SectionHeading from "@/app/_components/common/SectionHeading";
import Image from "next/image";
import Link from "next/link";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import UpdateStatusButton from "../_comp/UpdateStatusButton";
import { buildProductUrl } from "@/app/s/[storeSlug]/p/utility";

const getOrderById = async (id: string) => {
    "use cache";
    cacheLife("minutes");
    cacheTag(`admin-order-orderId-${id}`);

    const data = await prisma.whatsAppOrder.findUnique({
        where: {
            id: Number(id),
        },
        select: {
            id: true,
            orderRef: true,
            status: true,
            userId: true,
            quantity: true,
            unitPrice: true,
            message: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            variant: {
                select: {
                    id: true,
                    options: {
                        select: {
                            key: true,
                            value: true,
                        },
                    },
                    images: {
                        where: {
                            isPrimary: true,
                        },
                        take: 1,
                        select: {
                            image: true,
                        },
                    },
                },
            },
            user: {
                select: {
                    email: true,
                },
            },
        },
    });

    if (!data) return null;

    return {
        ...data,
        unitPrice: Number(data.unitPrice),

    };

};

const statuses = [
    "INITIATED",
    "RECEIVED",
    "PENDING",
    "CONFIRMED",
    "DELIVERED",
];

const OrderPage = async (props: PageProps<'/admin/orders/[orderId]'>) => {
    const { orderId } = await props.params;
    const order = await getOrderById(orderId);
    const admin = await getAuthenticatedAdmin();
    if (!order) notFound();
    const currentStep = statuses.indexOf(order.status);

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <SectionHeading title={`Order ${order.orderRef}`} />
                <span
                    className={`${styles.status} ${styles[order.status.toLowerCase()]
                        }`}
                >
                    {order.status}
                </span>
            </div>
            <div className={styles.grid}>
                {/* Product */}
                <section
                    className={`${styles.card} ${styles.productCard}`}
                >
                    <div className={styles.productImage}>
                        {order.variant?.images?.[0] && (
                            <Image
                                src={`/api/image?imageId=${encodeURIComponent(
                                    order.variant.images[0].image
                                )}`}
                                alt={order.product.name}
                                width={200}
                                height={200}
                            />
                        )}
                    </div>
                    <div className={styles.productInfo}>
                        <h2>{order.product.name}</h2>
                        <div className={styles.variantList}>
                            {order.variant?.options.map((opt) => (
                                <div key={opt.key}>
                                    <span>{opt.key}</span>
                                    <strong>{opt.value}</strong>
                                </div>
                            ))}
                        </div>
                        <div className={styles.priceBlock}>
                            <p>Quantity: {order.quantity}</p>
                            <p>₹{(
                                order.unitPrice * order.quantity
                            ).toLocaleString()}
                            </p>
                        </div>
                        <Link
                            target="_blank"
                            href={buildProductUrl(
                                admin.storeSlug!,
                                order.product.slug,
                                order.variant?.options
                            )}
                            className={styles.productLink}
                        >
                            View Product →
                        </Link>
                    </div>
                </section>

                {/* Customer */}
                <section className={styles.card}>
                    <h2>Customer Details</h2>
                    <div className={styles.infoList}>
                        <div>
                            <span>Email</span>
                            <strong>
                                {order.user?.email ?? "Guest User"}
                            </strong>
                        </div>
                        <div>
                            <span>User ID</span>
                            <strong>{order.userId ?? "N/A"}</strong>
                        </div>
                    </div>
                </section>

                {/* Message */}
                <section
                    className={`${styles.card} ${styles.fullWidth}`}
                >
                    <h2>Customer Message</h2>
                    <p>
                        {order.message ||
                            "No additional message provided."}
                    </p>
                </section>
            </div>
            {/* Timeline */}

            <div className={styles.timeline}>

                {statuses.map((status, index) => (
                    <div
                        key={status}
                        className={`${styles.step} ${index <= currentStep
                            ? styles.done : ""}`}
                    >
                        <span>{status}</span>
                    </div>
                ))}
            </div>



            {/* Actions */}
            <div className={styles.actions}>

                {order.status === "INITIATED" && (
                    <UpdateStatusButton
                        orderId={order.id}
                        status="RECEIVED"
                        storeSlug={admin.storeSlug}
                        slug={order.product.slug}
                    />

                )}



                {order.status === "RECEIVED" && (
                    <UpdateStatusButton
                        orderId={order.id}
                        status="PENDING"
                        storeSlug={admin.storeSlug}
                        slug={order.product.slug}
                    />

                )}

                {order.status === "PENDING" && (
                    <UpdateStatusButton
                        orderId={order.id}
                        status="CONFIRMED"
                        storeSlug={admin.storeSlug}
                        slug={order.product.slug}
                    />
                )}



                {order.status === "CONFIRMED" && (
                    <UpdateStatusButton
                        orderId={order.id}
                        status="DELIVERED"
                        storeSlug={admin.storeSlug}
                        slug={order.product.slug}
                    />
                )}



                {!["DELIVERED", "CANCELLED"].includes(

                    order.status
                ) && (
                        <UpdateStatusButton
                            orderId={order.id}
                            status="CANCELLED"
                            storeSlug={admin.storeSlug}
                            slug={order.product.slug}
                            danger
                        />
                    )}
            </div>
        </div>
    );
};



export default OrderPage;