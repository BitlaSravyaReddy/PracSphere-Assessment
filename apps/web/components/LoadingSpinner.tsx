// this is a loading spinner component with 3D rotating orbits
// Theme-adaptive: automatically adjusts colors based on light/dark mode
"use client";

import styles from '@/styles/LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinnerBox}>
        <div className={`${styles.blueOrbit} ${styles.leo}`}></div>
        <div className={`${styles.greenOrbit} ${styles.leo}`}></div>
        <div className={`${styles.redOrbit} ${styles.leo}`}></div>
        <div className={`${styles.centerOrbit} ${styles.w1} ${styles.leo}`}></div>
        <div className={`${styles.centerOrbit} ${styles.w2} ${styles.leo}`}></div>
        <div className={`${styles.centerOrbit} ${styles.w3} ${styles.leo}`}></div>
      </div>
    </div>
  );
}
