"use client";
import { toast } from "sonner";
import styles from "../buyNowBtn.addToCartBtn/Buy-CartBtn.module.css"
const AddToCartBtn = () => {
    const handleAddToCart = () => {
        // console.log("Add to cart:", { variantId: selectedVariant?.id, quantity });
        // Add cart logic here
        toast.message("This Feature will be available soon !");
    };

    return (
        <button className={styles.btnAddToCart} onClick={handleAddToCart}>
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
            >
                <path
                    d="M9 2L6 6H3L8 21h8l5-15h-3l-3-4z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="9" cy="21" r="1" fill="currentColor" />
                <circle cx="15" cy="21" r="1" fill="currentColor" />
            </svg>
            Add to Cart
        </button>
    );
}

export default AddToCartBtn;