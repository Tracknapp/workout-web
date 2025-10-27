"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface TimeInputProps {
  value: number | undefined; // Now accepts seconds as number
  onChange: (value: number) => void; // Now returns seconds as number
  className?: string;
  placeholder?: string;
}

// Convert seconds to hh:mm:ss format
function secondsToTimeString(seconds: number | undefined): string {
  if (!seconds || seconds === 0) return "";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Convert hh:mm:ss format to seconds
function timeStringToSeconds(timeString: string): number {
  const parts = timeString.split(":");
  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const seconds = parseInt(parts[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

export function TimeInput({
  value,
  onChange,
  className,
  placeholder = "00:00:00",
}: TimeInputProps) {
  const [displayValue, setDisplayValue] = useState(secondsToTimeString(value));

  useEffect(() => {
    setDisplayValue(secondsToTimeString(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow empty input
    if (input === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Extract only digits
    const digits = input.replace(/\D/g, "");

    if (digits.length === 0) {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Limit to 6 digits (hhmmss)
    const limitedDigits = digits.slice(0, 6);

    // Auto-format as user types
    let formatted = "";
    if (limitedDigits.length <= 2) {
      formatted = limitedDigits;
    } else if (limitedDigits.length <= 4) {
      formatted = `${limitedDigits.slice(0, 2)}:${limitedDigits.slice(2)}`;
    } else {
      formatted = `${limitedDigits.slice(0, 2)}:${limitedDigits.slice(2, 4)}:${limitedDigits.slice(4, 6)}`;
    }

    setDisplayValue(formatted);

    // If we have 6 digits, validate and save
    if (limitedDigits.length === 6) {
      const hours = parseInt(limitedDigits.slice(0, 2));
      const minutes = parseInt(limitedDigits.slice(2, 4));
      const seconds = parseInt(limitedDigits.slice(4, 6));

      // Validate time values
      if (minutes >= 60 || seconds >= 60) {
        // Invalid time, don't save - reset to previous value
        setDisplayValue(secondsToTimeString(value));
        return;
      }

      // Convert to seconds and save
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      onChange(totalSeconds);
    }
  };

  const handleBlur = () => {
    // If there's partial input on blur, pad it and save
    if (displayValue && displayValue.replace(/\D/g, "").length > 0) {
      const digits = displayValue.replace(/\D/g, "");

      if (digits.length > 0 && digits.length < 6) {
        // Pad to 6 digits
        const paddedDigits = digits.padEnd(6, "0");
        const hours = parseInt(paddedDigits.slice(0, 2));
        const minutes = parseInt(paddedDigits.slice(2, 4));
        const seconds = parseInt(paddedDigits.slice(4, 6));

        // Validate
        if (minutes >= 60 || seconds >= 60) {
          // Invalid - reset to previous value
          setDisplayValue(secondsToTimeString(value));
          return;
        }

        // Format and save
        const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        setDisplayValue(formatted);

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        onChange(totalSeconds);
      }
    }
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      maxLength={8} // hh:mm:ss
    />
  );
}
