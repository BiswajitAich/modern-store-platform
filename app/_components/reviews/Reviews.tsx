"use server";
import { tryIt } from "@/app/_lib/custom";
import styles from "./Reviews.module.css";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
// import { cacheTag } from "next/cache";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name?: string;
  };
}
const getReviews = async (productId: number) => {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-reviews-${productId}`);

  return await tryIt<any>(async () => {
    return await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  });
};
const Reviews = async ({ productId }: { productId: number }) => {
  const [err, reviews] = await getReviews(productId);
  if (err) {
    return <div className={styles.error}>Failed to load reviews.</div>;
  }

  if (reviews.length === 0) {
    return <div className={styles.empty}>No reviews yet.</div>;
  }
  return (
    <div className={styles.reviewsList}>
      {reviews.map((review: Review) => (
        <div key={review.id} className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <div className={styles.reviewerInfo}>
              <div className={styles.reviewerAvatar}>
                {review.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <h4 className={styles.reviewerName}>
                  {review.user?.name ?? "Anonymous"}
                </h4>
                <div className={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={styles.reviewStar}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={i < 4 ? "currentColor" : "none"}
                      stroke="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <span className={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className={styles.reviewText}>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default Reviews;