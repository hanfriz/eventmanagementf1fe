"use client";

import { useEffect, useRef } from "react";

interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export default function ProgressBar({
  percentage,
  className = "",
}: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${clampedPercentage}%`;
    }
  }, [clampedPercentage]);

  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}
    >
      <div
        ref={progressRef}
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        data-percentage={clampedPercentage}
        data-testid="progress-fill"
      />
    </div>
  );
}
