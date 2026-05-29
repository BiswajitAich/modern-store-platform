import styles from "./Reviews.module.css";
import AddReviewBtn from "../btns/addReviewBtn/AddReviewBtn";
import { fetchIfUserCanGiveReview, getReviews } from "./review.action";
import { getAuthenticatedUser } from "@/app/_lib/customForServerSide";


const Reviews = async ({ productId, count }: { productId: number, count: number }) => {
  const user = await getAuthenticatedUser();

  const canGiveReview = await fetchIfUserCanGiveReview(productId, user.id);

  if (count === 0) {
    return <div className={styles.empty}>No reviews yet.</div>;
  }

  const reviews = await getReviews(productId);
  if (!reviews) {
    return <div className={styles.error}>Failed to load reviews.</div>;
  }

  return (
    <div className={styles.reviewsContent}>
      {canGiveReview ? (
        <div className={styles.reviewsHeader}>
          <h2 className={styles.contentTitle}>Give Review</h2>
          <AddReviewBtn productId={productId} />
        </div>
      ) : null}
      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <div className={styles.reviewerAvatar}>
                  {review.user?.firstName?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <h4 className={styles.reviewerName}>
                    {review.user?.firstName || review.user?.lastName
                      ? `${review.user?.firstName ?? ""} ${review.user?.lastName ?? ""}`.trim()
                      : "Anonymous"}
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
    </div>
  );
};

export default Reviews;