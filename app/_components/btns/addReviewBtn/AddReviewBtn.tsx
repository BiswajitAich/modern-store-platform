"use client";
import { useEffect, useState } from "react";
import styles from "./AddReviewBtn.module.css";
import { tryIt } from "@/app/_lib/custom";
import { toast } from "sonner";
interface ReviewFormContentDataProps {
  comment: string;
  rating: number;
}
const AddReviewBtn = ({ productId }: { productId: number }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ReviewFormContentDataProps>({
    comment: "",
    rating: 4,
  });
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="button buttonSecondary"
        onClick={() => setIsOpen((p) => !p)}
      >
        Write a Review
      </button>
      {isOpen && (
        <div className={styles.reviewForm}>
          <ReviewFormContent
            productId={productId}
            setIsOpen={setIsOpen}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      )}
    </>
  );
};

export default AddReviewBtn;

const ReviewFormContent = ({
  productId,
  setIsOpen,
  formData,
  setFormData,
}: {
  productId: number;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formData: { comment: string; rating: number };
  setFormData: React.Dispatch<React.SetStateAction<ReviewFormContentDataProps>>;
}) => {
  const [pending, setPending] = useState<boolean>(false);
  const addReview = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const [error, msg] = await tryIt(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          rating: formData.rating,
          comment: formData.comment.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit review");
      }

      return data;
    });
    if (error || msg?.success === false) {
      console.log("Failed to submit review:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit review. Please try again.",
      );
      setPending(false);
      return;
    }
    toast.success("Review submitted successfully!");
    setPending(false);
    setIsOpen(false);
  };
  return (
    <form className={styles.reviewFormContent} onSubmit={addReview}>
      <h3 className={styles.formTitle}>Add Your Review</h3>
      <div className={styles.ratingContainer}>
        <span className={styles.ratingLabel}>Your Rating:</span>
        <div className={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
              className={`${styles.star} ${i < formData.rating ? styles.starFilled : ""}`}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, rating: i + 1 }))
              }
              disabled={pending}
              aria-label={`Rate ${i + 1} stars`}
            >
              <svg
                className={styles.star}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <textarea
        name="comment"
        className={styles.reviewInput}
        placeholder="Write your review here..."
        value={formData.comment}
        maxLength={200}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            comment: e.target.value.replace(/\s+/g, " "),
          }))
        }
        disabled={pending}
        aria-label="Write your review"
      />
      <div className={styles.formActions}>
        <button
          type="button"
          className="button buttonSecondary"
          onClick={() => setIsOpen(false)}
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button buttonPrimary"
          disabled={
            pending || formData.comment.trim() === "" || formData.rating < 1
          }
        >
          Submit Review
        </button>
      </div>
    </form>
  );
};
