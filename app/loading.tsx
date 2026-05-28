import styles from "./styles/Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent} aria-live="polite">
        <LoadingSpinner />
        <p className={styles.loadingText}>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;

export const LoadingSpinner = () => {
  return (
    <div className={styles.spinner}>
      <div className={styles.spinnerRing}></div>
      <div className={styles.spinnerRing}></div>
      <div className={styles.spinnerRing}></div>
    </div>
  );
}