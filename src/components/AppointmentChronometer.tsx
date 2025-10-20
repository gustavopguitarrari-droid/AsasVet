"use client";

import React, { useState, useEffect } from 'react';
import { differenceInSeconds, parseISO, setHours, setMinutes } from 'date-fns';

interface AppointmentChronometerProps {
  date: string; // e.g., "2024-10-29"
  time: string; // e.g., "16:00"
}

const AppointmentChronometer: React.FC<AppointmentChronometerProps> = ({ date, time }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds

  useEffect(() => {
    // Combine date and time to create a start Date object
    const [hours, minutes] = time.split(':').map(Number);
    let startDate = parseISO(date);
    startDate = setHours(startDate, hours);
    startDate = setMinutes(startDate, minutes);

    const interval = setInterval(() => {
      const now = new Date();
      const diffSeconds = differenceInSeconds(now, startDate);
      setElapsedTime(Math.max(0, diffSeconds)); // Ensure elapsed time is not negative
    }, 1000);

    return () => clearInterval(interval);
  }, [date, time]);

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