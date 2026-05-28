import Link from "next/link";
import Image from "next/image";
import styles from "./StoreCard.module.css";
import { StoreCardDTO } from "@/app/_lib/db/types/store.types";

interface Props {
    data: StoreCardDTO;
}

const StoreCard = ({ data }: Props) => {
    return (
        <Link href={`/s/${data.storeSlug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {data.profileImage ? (
                    <Image
                        src={`/api/image?imageId=${encodeURIComponent(data.profileImage)}`}
                        alt={data.storeSlug}
                        fill
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>{data.storeSlug.charAt(0)}..{data.storeSlug.charAt(data.storeSlug.length - 1)}</div>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>@{data.storeSlug}</h3>

                <div className={styles.meta}>
                    <span>{data.productCount} products</span>
                    <span>•</span>
                    <span>{data.categoryCount} categories</span>
                </div>
            </div>
        </Link>
    );
};

export default StoreCard;