"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimeInput({
  value,
  onChange,
  className,
  placeholder = "00:00:00",
}: TimeInputProps) {
  const [displayValue, setDisplayValue] = useState(value || "");

  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  const formatTime = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, "");

    // Limit to 6 digits (hhmmss)
    const limitedDigits = digits.slice(0, 6);

    // Pad with zeros if needed
    const paddedDigits = limitedDigits.padEnd(6, "0");

    // Format as hh:mm:ss
    const hours = paddedDigits.slice(0, 2);
    const minutes = paddedDigits.slice(2, 4);
    const seconds = paddedDigits.slice(4, 6);

    return `${hours}:${minutes}:${seconds}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow empty input
    if (input === "") {
      setDisplayValue("");
      onChange("");
      return;
    }

    // Extract only digits
    const digits = input.replace(/\D/g, "");

    if (digits.length === 0) {
      setDisplayValue("");
      onChange("");
      return;
    }

    // Format the digits
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
    }

    setDisplayValue(formatted);

    // Only call onChange with fully formatted time (6 digits)
    if (digits.length === 6) {
      const hours = digits.slice(0, 2);
      const minutes = digits.slice(2, 4);
      const seconds = digits.slice(4, 6);

      // Validate time values
      const h = parseInt(hours);
      const m = parseInt(minutes);
      const s = parseInt(seconds);

      if (m >= 60 || s >= 60) {
        // Invalid time, don't save
        return;
      }

      onChange(`${hours}:${minutes}:${seconds}`);
    } else if (digits.length < 6) {
      // Auto-complete with zeros when blurring or use current digits
      onChange(formatted);
    }
  };

  const handleBlur = () => {
    if (displayValue && displayValue.replace(/\D/g, "").length > 0) {
      const formatted = formatTime(displayValue);
      setDisplayValue(formatted);
      onChange(formatted);
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
