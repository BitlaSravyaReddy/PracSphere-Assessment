// this code defines a progress bubble component that displays a circular progress indicator in the dashboard
"use client";
import { useState, useEffect } from "react";
import styles from "../styles/ProgressBubble.module.css";

interface ProgressBubbleProps {
  percent: number;
  showInput?: boolean;
}

export default function ProgressBubble({ percent, showInput = false }: ProgressBubbleProps) {
  const [displayPercent, setDisplayPercent] = useState<number>(percent);

  // Update display percent when prop changes
  useEffect(() => {
    setDisplayPercent(percent);
  }, [percent]);

  // Determine color class based on percent
  const colorClass =
    displayPercent < 33 ? styles.red : displayPercent < 66 ? styles.orange : styles.green;

  return (
    <div className={styles.wrapper}>
      <div className={colorClass}>
        <div className={styles.progress}>
          <div className={styles.inner}>
            <div className={styles.percent}>
              <span>{Math.round(displayPercent)}</span>%
            </div>
            <div
              className={styles.water}
              style={{ top: `${100 - displayPercent}%` }}
            ></div>
            <div className={styles.glare}></div>
          </div>
        </div>
      </div>

      {showInput && (
        <span className={styles.inputWrap}>
          Enter Percentage:{" "}
          <input
            type="number"
            value={Math.round(displayPercent)}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 100) setDisplayPercent(val);
            }}
            placeholder="67"
            className={styles.input}
          />
          %
        </span>
      )}
    </div>
  );
}
