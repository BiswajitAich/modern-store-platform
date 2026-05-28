"use client";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "./styles/Herocarousel.module.css";
import Link from "next/link";
import CarouselNavBtn from "../btns/carouselNavBtn/CarouselNavBtn";
import CarouselDotBtn from "../btns/carouselDotBtns/CarouselDotBtn";
import { HeroDTO } from "@/app/_lib/db/types/hero.types";

interface HerodataProps {
  data: HeroDTO[];
}

const Herocarousel = ({ data }: HerodataProps) => {
  const autoplay =
    data.length > 1
      ? Autoplay({ delay: 5000, stopOnInteraction: false })
      : undefined;
  const [carouselRef, emblaApi] = useEmblaCarousel(
    { loop: data.length > 1 },
    autoplay ? [autoplay] : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎨</div>
        <p className={styles.emptyText}>No hero banners available</p>
      </div>
    );
  }

  return (
    <div className={styles.carouselWrapper}>
      <div ref={carouselRef} className={styles.embla}>
        <div className="emblaContainer">
          {data.map((item) => (
            <div className={styles.emblaSlide} key={item.id}>
              <div className={styles.imageWrapper}>
                <Image
                  src={
                    item.image
                      ? `/api/image?imageId=${encodeURIComponent(item.image)}`
                      : "/placeholder.png"
                  }
                  fill
                  priority
                  alt={item.title}
                  className={styles.heroImage}
                  sizes="100vw"
                />

                {/* Overlay Content */}
                <div className={styles.overlay}>
                  <div className={styles.content}>
                    <h1 className={styles.title}>{item.title}</h1>
                    {item.subtitle && (
                      <p className={styles.subtitle}>{item.subtitle}</p>
                    )}
                    {(item.product?.slug || item.category?.slug) && (
                      <Link
                        href={
                          item.product?.slug as string ? `/s/${item.admin.storeSlug}/p/${item.product?.slug}` :
                            `/s/${item.admin.storeSlug}/c/${item.category?.slug}`
                        }
                        className={styles.ctaButton}
                      >
                        {item.buttonText || "Shop Now"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {data.length > 1 && (
        <CarouselNavBtn onPrev={scrollPrev} onNext={scrollNext} />
      )}

      {/* Dot Indicators */}
      {data.length > 1 && (
        <div className={styles.dots}>
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

export default Herocarousel;
