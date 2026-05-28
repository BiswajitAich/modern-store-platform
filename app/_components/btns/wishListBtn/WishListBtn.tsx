"use client";

import { toast } from "sonner";
import { addToWishListAction } from "../../../s/[storeSlug]/action";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./WishListBtn.module.css";
import { useSession } from "next-auth/react";

interface WishListBtnProps {
  variantId: number | null;
  productId: number;
  isLiked: boolean;
}

const WishListBtn = ({
  variantId,
  productId,
  isLiked,
}: WishListBtnProps) => {
  const router = useRouter();
  const [liking, setLiking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: session } = useSession();
  
  useEffect(() => {
    audioRef.current = new Audio("/sounds/water-drop.mp3");
    audioRef.current.volume = 0.4;
  }, []);

  const handleAddToWishlist = async () => {
    if (liking) return;
    setLiking(true);

    const path = window.location.pathname;
    console.log(path + "---" + session?.user?.role === "user");

    if (!session || session?.user?.role === "admin" && path !== "/account/wishlist") {
      toast.message(
        "Please log as Valid 'User' to add items to your wishlist.",
      );
      setLiking(false);
      return;
    }
    console.log("handleAddToWishlist");
    if (!variantId || !productId) {
      toast.error("Invalid product or variant.");
      console.log("varientId:" + variantId, "productId:" + productId);
      setLiking(false);
      return;
    }
    const result = await addToWishListAction({
      variantId,
      productId,
      path,
    });
    setTimeout(() => {
      setLiking(false);
      if (result.success) {
        router.refresh();
      }
    }, 10000);
    if (!result.success) {
      if (result.message === "LOGIN_REQUIRED") {
        router.push("/auth");
        return;
      }
      if (result.message === "INVALID_INPUT") {
        toast.error("Invalid product or variant.");
        return;
      }
      if (result.message === "SERVER_ERROR") {
        toast.error("Server error. Please try again later.");
        return;
      }
      toast.error("Something went wrong");
      return;
    }
    toast.success(
      result.message === "ADDED"
        ? "Added to wishlist"
        : "Removed from wishlist",
    );
    if (audioRef.current && result.message === "ADDED") {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <button
      className={`${styles.wishlistBtn} ${liking ? styles.loading : ""}`}
      onClick={handleAddToWishlist}
      style={{
        background: isLiked ? "radial-gradient(red, transparent 40%)" : "none",
      }}
      aria-pressed={isLiked}
      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
      disabled={liking}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isLiked ? "red" : "currentColor"}
        strokeWidth="2"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill={isLiked ? "red" : "none"}
        />
      </svg>
    </button>
  );
};

export default WishListBtn;
