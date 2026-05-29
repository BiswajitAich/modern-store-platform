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
    if (isAuthenticated && isConfirming) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
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

const UserConfirmation = ({
  selectedVariant,
  quantity,
  setIsConfirming,
  productData,
}: UserConfirmationProps) => {
  const router = useRouter();
  const [buying, setBuying] = useState(false);
  const handleBuyNow = async () => {
    setBuying(true);
    console.log("Buy now clicked:", { variant: selectedVariant, quantity });
    // return;
    if (!selectedVariant) {
      setBuying(false);
      return;
    }
    const newTab = window.open("", "_blank");
    const [error, response] = await tryIt(async () => {
      const productPath = window.location.origin + window.location.pathname;
      if (!productPath) {
        throw new Error("Product path not found");
      }
      const res = await fetch("/api/orderViaWA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
          productPath,
        }),
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
    if (error instanceof Error) {
      toast.error(error.message || "Failed to create WhatsApp order");
      if (error?.message === "UNAUTHORIZED") {
        router.push("/auth");
      }
      setBuying(false);
      return;
    }
    toast.success("Opening WhatsApp in new tab...");
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const url = isMobile ? response.whatsappAppUrl : response.whatsappWebUrl;
    if (newTab) {
      newTab.location.href = url;
    }
    setBuying(false);
  };

  return (
    <div className={styles.confirmationOverlay}>
      <div className={styles.confirmationBox}>
        <h2 className="heading">Confirm Your Order</h2>
        <div className="underline" />
        <EmblaCarousel slides={selectedVariant?.images || []} />
        <div>
          <span
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "bold",
            }}
          >
            Variant:
          </span>
          <br />
          {selectedVariant?.options.map((opt) =>
            opt.key.toLowerCase() === "color" ||
              opt.key.toLowerCase() === "colour" ? (
              <div key={opt.id}>
                {opt.key}:
                <span
                  style={{
                    backgroundColor: opt.value,
                    padding: "2px var(--spacing-sm)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    marginLeft: "var(--spacing-sm)",
                  }}
                  title={opt.value}
                >
                  {opt.value}
                </span>
                {"("}
                {opt.value}
                {")"}
              </div>
            ) : (
              <div key={opt.id}>
                {opt.key}: {opt.value}
              </div>
            ),
          )}
        </div>
        <p>Quantity: {quantity}</p>
        {selectedVariant?.price && selectedVariant?.originalPrice && (
          <Price
            price={selectedVariant?.price}
            originalPrice={selectedVariant?.originalPrice}
          />
        )}
        <DescRating productData={productData} />
        <div
          style={{
            display: "flex",
            gap: "2%",
            flexWrap: "wrap",
            marginTop: "var(--spacing-sm)",
          }}
        >
          <button
            className="button "
            onClick={() => {
              toast.message("Feature will be added soon!");
              // router.push("/cart")
            }}
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
            onClick={() => handleBuyNow()}
            disabled={buying}
            aria-label="buy button"
          >
            {buying ? "please wait..." : "Continute to WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmblaCarousel = ({ slides }: { slides: string[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
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
    <div className="embla">
      <div
        style={{
          maxHeight: "200px",
          position: "relative",
        }}
        ref={emblaRef}
      >
        <div className="emblaContainer">
          {slides.map((slide, index) => (
            <div
              className="emblaSlide"
              style={{
                maxHeight: "200px",
                aspectRatio: "1",
              }}
              key={index}
            >
              <Image
                src={`/api/image?imageId=${encodeURIComponent(slide)}`}
                alt="Product Image"
                width={100}
                height={100}
              />
            </div>
          ))}
        </div>
        {/* Navigation Buttons */}
        {slides.length > 1 && (
          <CarouselNavBtn onPrev={scrollPrev} onNext={scrollNext} />
        )}
      </div>

      {/* Dot Indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "var(--spacing-xs)",
          marginTop: "var(--spacing-xs)",
        }}
      >
        <CarouselDotBtn
          scrollSnaps={scrollSnaps}
          scrollTo={scrollTo}
          selectedIndex={selectedIndex}
        />
      </div>
    </div>
  );
};
