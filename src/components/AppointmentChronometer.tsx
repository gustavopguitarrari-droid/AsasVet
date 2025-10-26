"use client";

import React, { useState, useEffect } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';

interface AppointmentChronometerProps {
  startTime: string; // e.g., "2024-10-29T10:30:00.000Z" (ISO string from created_at)
}

const AppointmentChronometer: React.FC<AppointmentChronometerProps> = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds

  useEffect(() => {
    const startDate = parseISO(startTime); // Parse the ISO string directly

    const interval = setInterval(() => {
      const now = new Date();
      const diffSeconds = differenceInSeconds(now, startDate);
      setElapsedTime(Math.max(0, diffSeconds)); // Ensure elapsed time is not negative
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]); // Dependency is the `startTime` string

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  return (
    <span className="font-mono text-sm text-muted-foreground ml-2">
      {formatTime(elapsedTime)}
    </span>
  );
};

export default AppointmentChronometer;