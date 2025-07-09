"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadline: string;
  onExpire?: () => void;
  className?: string;
}

export default function CountdownTimer({
  deadline,
  onExpire,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        onExpire?.();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, expired: false });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="font-medium">Payment deadline expired</span>
      </div>
    );
  }

  const getUrgencyColor = () => {
    const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
    if (totalMinutes <= 30) return "text-red-600";
    if (totalMinutes <= 60) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <div
      className={`flex items-center space-x-2 ${getUrgencyColor()} ${className}`}
    >
      <Clock className="h-4 w-4" />
      <span className="font-medium">
        {timeLeft.hours.toString().padStart(2, "0")}:
        {timeLeft.minutes.toString().padStart(2, "0")}:
        {timeLeft.seconds.toString().padStart(2, "0")}
      </span>
      <span className="text-sm">remaining</span>
    </div>
  );
}
