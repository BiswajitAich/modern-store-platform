"use client"
import WishListBtn from "@/app/_components/btns/wishListBtn/WishListBtn";
import Link from "next/link";
import styles from "./PUI.module.css";
import Image from "next/image";
import { JSX, useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface FlatSearchParams {
    [key: string]: string;
}
interface SelectedVariant {
    id?: string | number;
    [key: string]: any;
}
interface ImageGallaryProps {
    images: string[];
    flatSearchParams: FlatSearchParams;
    isLiked: boolean;
    title: string;
    imageIndex: number;
    selectedImage: string;
    selectedVariant: SelectedVariant | null;
    productId: string | number;
}

const ImageGallary = ({
    images,
    flatSearchParams,
    isLiked,
    title,
    imageIndex,
    selectedImage,
    selectedVariant,
    productId,
}: ImageGallaryProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(imageIndex);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex: imageIndex });

    // Sync embla to current lightbox index
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setLightboxIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        return () => { emblaApi.off("select", onSelect); };
    }, [emblaApi, onSelect]);

    // Jump to correct slide when opening
    const openLightbox = () => {
        setLightboxIndex(imageIndex);
        setIsOpen(true);
    };

    useEffect(() => {
        if (isOpen && emblaApi) {
            emblaApi.scrollTo(imageIndex, true);
        }
    }, [isOpen, emblaApi, imageIndex]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") setIsOpen(false);
            if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
            if (e.key === "ArrowRight") emblaApi?.scrollNext();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, emblaApi]);

    return (
        <>
            <div className={styles.imageSection}>
                <div className={styles.thumbnailList}>
                    {images.map((img, i) => (
                        <Link
                            key={i}
                            href={`?${new URLSearchParams({
                                ...flatSearchParams,
                                image: i.toString(),
                            })}`}
                            scroll={false}
                            prefetch={false}
                            className={`${styles.thumbnail} ${imageIndex === i ? styles.thumbnailActive : ""}`}
                            style={{ pointerEvents: imageIndex === i ? "none" : "auto" }}
                        >
                            <Image
                                src={`/api/image?imageId=${encodeURIComponent(img)}`}
                                alt={`${title} - ${i + 1}`}
                                fill
                                sizes="80px"
                                className={styles.thumbnailImage}
                            />
                        </Link>
                    ))}
                </div>

                <div className={styles.mainImageWrapper}>
                    <div
                        className={styles.mainImage}
                        onClick={openLightbox}
                        style={{ cursor: "zoom-in" }}
                    >
                        <Image
                            src={`/api/image?imageId=${encodeURIComponent(selectedImage)}`}
                            alt={title}
                            fill
                            sizes="(max-width: 500px) 100vw, 50vw"
                            priority
                            fetchPriority="high"
                            placeholder="blur"
                            blurDataURL="/blur.webp"
                            className={styles.productImage}
                            quality={75}
                        />
                        <WishListBtn
                            variantId={selectedVariant ? Number(selectedVariant.id) : null}
                            productId={Number(productId)}
                            isLiked={isLiked}
                        />
                    </div>
                </div>
            </div>

            {/* Lightbox Portal */}
            {isOpen && (
                <div className={styles.lightboxOverlay} onClick={() => setIsOpen(false)}>
                    {/* Close button */}
                    <button
                        className={styles.lightboxClose}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    {/* Counter */}
                    <div className={styles.lightboxCounter}>
                        {lightboxIndex + 1} / {images.length}
                    </div>

                    {/* Prev button */}
                    {images.length > 1 && (
                        <button
                            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                            onClick={(e) => { e.stopPropagation(); emblaApi?.scrollPrev(); }}
                            aria-label="Previous"
                        >
                            ‹
                        </button>
                    )}

                    {/* Embla carousel */}
                    <div
                        className={styles.lightboxCarousel}
                        ref={emblaRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.lightboxCarouselContainer}>
                            {images.map((img, i) => (
                                <div key={i} className={styles.lightboxSlide}>
                                    <div className={styles.lightboxImageWrapper}>
                                        <Image
                                            src={`/api/image?imageId=${encodeURIComponent(img)}`}
                                            alt={`${title} - ${i + 1}`}
                                            fill
                                            sizes="100vw"
                                            quality={90}
                                            className={styles.lightboxImage}
                                            priority={i === lightboxIndex}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next button */}
                    {images.length > 1 && (
                        <button
                            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                            onClick={(e) => { e.stopPropagation(); emblaApi?.scrollNext(); }}
                            aria-label="Next"
                        >
                            ›
                        </button>
                    )}

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div
                            className={styles.lightboxThumbs}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    className={`${styles.lightboxThumb} ${lightboxIndex === i ? styles.lightboxThumbActive : ""}`}
                                    onClick={() => emblaApi?.scrollTo(i)}
                                    aria-label={`Go to image ${i + 1}`}
                                >
                                    <Image
                                        src={`/api/image?imageId=${encodeURIComponent(img)}`}
                                        alt={`${title} - ${i + 1}`}
                                        fill
                                        sizes="64px"
                                        className={styles.lightboxThumbImage}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ImageGallary;