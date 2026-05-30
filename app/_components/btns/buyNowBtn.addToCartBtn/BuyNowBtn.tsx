"use client";
import { tryIt } from "@/app/_lib/custom";
import styles from "./Buy-CartBtn.module.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Price from "../../price/Price";
import DescRating from "../../desc_rating/DescRating";
import CarouselNavBtn from "../carouselNavBtn/CarouselNavBtn";
import CarouselDotBtn from "../carouselDotBtns/CarouselDotBtn";
import { ProductPageSerialized } from "@/app/_lib/db/types/product.types";

interface BuyNowBtnProps {
  selectedVariant:
    | {
        id: number;
        productId: number;
        price: number | null;
        originalPrice: number | null;
        stock: number;
        sku: string | null;
        optionHash: string;
        updatedAt: string;
        images: string[];
        options: {
          id: number;
          key: string;
          value: string;
        }[];
      }
    | null
    | undefined;
  quantity: number;
  isAuthenticated?: boolean;
  productData: ProductPageSerialized;
}

interface UserConfirmationProps extends BuyNowBtnProps {
  setIsConfirming: (value: boolean) => void;
}

const BuyNowBtn = ({
  selectedVariant,
  quantity,
  isAuthenticated,
  productData,
}: BuyNowBtnProps) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow =
      isAuthenticated && isConfirming ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isConfirming, isAuthenticated]);

  return (
    <>
      <button
        className={styles.btnBuyNow}
        onClick={() => {
          if (!isAuthenticated) {
            toast.error("Please log in to proceed with the purchase.");
            return;
          }
          setIsConfirming(true);
        }}
        disabled={!selectedVariant}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        Buy Now
      </button>

      {isConfirming && (
        <UserConfirmation
          selectedVariant={selectedVariant}
          quantity={quantity}
          setIsConfirming={setIsConfirming}
          productData={productData}
        />
      )}
    </>
  );
};

export default BuyNowBtn;

// ─── User Confirmation Modal ──────────────────────────────────────────────────

const UserConfirmation = ({
  selectedVariant,
  quantity,
  setIsConfirming,
  productData,
}: UserConfirmationProps) => {
  const router = useRouter();
  const [buying, setBuying] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !buying) setIsConfirming(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buying, setIsConfirming]);

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    setBuying(true);

    const newTab = window.open("", "_blank");

    const [error, response] = await tryIt(async () => {
      const productPath = window.location.origin + window.location.pathname;
      const res = await fetch("/api/orderViaWA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
          productPath,
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    });

    if (error instanceof Error) {
      toast.error(error.message || "Failed to create WhatsApp order");
      if (error.message === "UNAUTHORIZED") router.push("/auth");
      setBuying(false);
      return;
    }

    toast.success("Opening WhatsApp...");
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const url = isMobile ? response.whatsappAppUrl : response.whatsappWebUrl;
    if (newTab) newTab.location.href = url;
    setBuying(false);
  };

  const isColorKey = (key: string) =>
    key.toLowerCase() === "color" || key.toLowerCase() === "colour";

  return (
    // Clicking the backdrop closes the modal
    <div
      className={styles.confirmationOverlay}
      onClick={() => !buying && setIsConfirming(false)}
    >
      {/* Stop clicks inside the box from closing the modal */}
      <div
        className={styles.confirmationBox}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm your order"
      >
        {/* Header */}
        <div className={styles.confirmationHeader}>
          <h2 className="heading">Confirm Your Order</h2>
          <button
            className={styles.closeBtn}
            onClick={() => setIsConfirming(false)}
            disabled={buying}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="underline" />

        {/* Carousel */}
        {selectedVariant?.images && selectedVariant.images.length > 0 && (
          <EmblaCarousel slides={selectedVariant.images} />
        )}

        {/* Variant options */}
        <div className={styles.variantInfo}>
          <span className={styles.variantLabel}>Variant:</span>
          <div className={styles.variantOptions}>
            {selectedVariant?.options.map((opt) =>
              isColorKey(opt.key) ? (
                <div key={opt.id} className={styles.optionRow}>
                  <span className={styles.optionKey}>{opt.key}:</span>
                  <span
                    className={styles.colorSwatch}
                    style={{ backgroundColor: opt.value }}
                    title={opt.value}
                  />
                  <span className={styles.optionValue}>{opt.value}</span>
                </div>
              ) : (
                <div key={opt.id} className={styles.optionRow}>
                  <span className={styles.optionKey}>{opt.key}:</span>
                  <span className={styles.optionValue}>{opt.value}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <p className={styles.quantityText}>
          Quantity: <strong>{quantity}</strong>
        </p>

        {selectedVariant?.price && selectedVariant?.originalPrice && (
          <Price
            price={selectedVariant.price}
            originalPrice={selectedVariant.originalPrice}
          />
        )}

        <DescRating productData={productData} />

        {/* Action buttons */}
        <div className={styles.actionRow}>
          <button
            className="button"
            onClick={() => toast.message("Feature will be added soon!")}
            disabled={buying}
          >
            View Cart
          </button>
          <button
            className="button buttonSecondary"
            onClick={() => setIsConfirming(false)}
            disabled={buying}
          >
            Cancel
          </button>
          <button
            className="button buttonPrimary"
            onClick={handleBuyNow}
            disabled={buying}
            aria-label="Confirm and open WhatsApp"
          >
            {buying ? "Please wait…" : "Continue to WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Embla Carousel ───────────────────────────────────────────────────────────

const EmblaCarousel = ({ slides }: { slides: string[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={styles.emblaRoot}>
      <div className={styles.emblaViewport} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => (
            <div key={index} className={styles.emblaSlide}>
              <div className={styles.emblaSlideInner}>
                <Image
                  src={`/api/image?imageId=${encodeURIComponent(slide)}`}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                  className={styles.emblaImage}
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <CarouselNavBtn onPrev={scrollPrev} onNext={scrollNext} />
        )}
      </div>

      {slides.length > 1 && (
        <div className={styles.emblaDots}>
          <CarouselDotBtn
            scrollSnaps={scrollSnaps}
            scrollTo={scrollTo}
            selectedIndex={selectedIndex}
          />
        </div>
      )}
    </div>
  );
};