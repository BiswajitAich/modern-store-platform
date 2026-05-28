import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.glowDot} />
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.line} />
      </div>

      {subtitle && (
        <p className={styles.subtitle}>{subtitle}</p>
      )}
    </div>
  );
};

export default SectionHeading;