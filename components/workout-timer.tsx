"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface WorkoutTimerProps {
  startTime: number | null;
}

export function WorkoutTimer({ startTime }: WorkoutTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    // Calculate initial elapsed time
    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // Convert to seconds
      setElapsedTime(elapsed);
    };

    // Update immediately
    updateElapsedTime();

    // Update every second
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (!startTime) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Clock className="size-4" />
      <span className="tabular-nums">{formatTime(elapsedTime)}</span>
    </div>
  );
}
