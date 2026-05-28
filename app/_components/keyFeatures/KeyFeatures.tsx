import styles from "./KeyFeatures.module.css";
const KeyFeatures = () => {
    return (
        <div className={styles.featuresSection}>
            <h3 className={styles.sectionTitle}>Key Features</h3>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    strokeWidth="2"
                  />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                </svg>
                7 Days Replacement Policy
              </li>
              <li className={styles.featureItem}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                    strokeWidth="2"
                  />
                </svg>
                Free Delivery
              </li>
              <li className={styles.featureItem}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect
                    x="2"
                    y="7"
                    width="20"
                    height="14"
                    rx="2"
                    strokeWidth="2"
                  />
                  <path d="M16 3v4M8 3v4M2 11h20" strokeWidth="2" />
                </svg>
                Cash on Delivery Available
              </li>
            </ul>
          </div>
    );
}

export default KeyFeatures;