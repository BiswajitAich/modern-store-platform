"use client";

import { useTransition } from "react";
import styles from "./order.module.css";
import { toast } from "sonner";

import { updateOrderStatus } from "../order.action";
import { WhatsAppOrderStatus } from "@/app/_lib/types";
import { useRouter } from "next/navigation";

type Props = {
    orderId: number;
    status?: WhatsAppOrderStatus;
    danger?: boolean;
    storeSlug?: string;
    slug?: string;
};

const UpdateStatusButton = ({
    orderId,
    status,
    danger,
    storeSlug,
    slug
}: Props) => {
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const handleClick = () => {
        if (!status) {
            toast.error("Status not found");
            return;
        }

        startTransition(async () => {
            try {
                const res = await updateOrderStatus(orderId, status, storeSlug, slug);
                if (!res.success) {
                    toast.error(res.message);
                    return;
                }
                toast.success(
                    `Order updated to ${status}`
                );
                router.refresh();
            } catch {
                toast.error(
                    "Unable to update status"
                );
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={pending}
            className={`${styles.actionBtn} ${danger
                ? styles.dangerBtn
                : styles.primaryBtn
                }`}
        >
            {pending ? "Updating..." : status}
        </button>
    );
};

export default UpdateStatusButton;