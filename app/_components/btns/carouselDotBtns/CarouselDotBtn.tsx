import styles from "./CarouselDotBtn.module.css";
const CarouselDotBtn = ({
  scrollSnaps,
  scrollTo,
  selectedIndex,
}: {
  scrollSnaps: number[];
  scrollTo: (index: number) => void;
  selectedIndex: number;
}) => {
  return (
    <>
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          className={`${styles.dot} ${
            index === selectedIndex ? styles.dotActive : ""
          }`}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </>
  );
};

export default CarouselDotBtn;
