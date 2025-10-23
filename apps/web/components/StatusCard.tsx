// This component displays a status card with a circular progress indicator and text for task stats in dashboard page.
"use client";

import styles from "../styles/StatusDashboard.module.css";

interface StatusCardProps {
  label: string;
  value: number;
  percentage: number;
  type: "inprogress" | "completed" | "overdue";
}

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StatusCard: React.FC<StatusCardProps> = ({
  label,
  value,
  percentage,
  type,
}) => {
  const dashOffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
  const gradientId =
    type === "inprogress"
      ? "gradient-blue"
      : type === "completed"
      ? "gradient-green"
      : "gradient-orange";

  return (
    <div className={`${styles.statusCard} ${styles[type]}`}>
      <div className={styles.statusLabel}>{label}</div>
      <div className={styles.statusContent}>
        <div className={styles.statusNumber}>{value}</div>
        <div className={styles.progressRing}>
          <svg>
            <defs>
              <linearGradient
                id="gradient-blue"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ff4db8" />
                <stop offset="100%" stopColor="#6b8cff" />
              </linearGradient>

              <linearGradient
                id="gradient-green"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#00ffb3" />
              </linearGradient>

              <linearGradient
                id="gradient-orange"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffb347" />
                <stop offset="100%" stopColor="#ff8c42" />
              </linearGradient>
            </defs>

            <circle
              className={styles.progressBg}
              cx="45"
              cy="45"
              r={RADIUS}
            />
            <circle
              className={styles.progressCircle}
              cx="45"
              cy="45"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              stroke={`url(#${gradientId})`}
            />
          </svg>
          <div className={styles.progressText}>{Math.round(percentage)}%</div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
