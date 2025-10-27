"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface WeightInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export function WeightInput({
  value,
  onChange,
  className,
  placeholder = "0",
}: WeightInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value !== undefined && value !== 0 ? value.toString() : ""
  );

  useEffect(() => {
    setDisplayValue(value !== undefined && value !== 0 ? value.toString() : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow empty input
    if (input === "") {
      setDisplayValue("");
      return;
    }

    // Allow numbers and a single decimal point
    // Allow partial inputs like "5." or ".5"
    const regex = /^\d*\.?\d*$/;
    if (regex.test(input)) {
      setDisplayValue(input);
    }
  };

  const handleBlur = () => {
    if (displayValue === "" || displayValue === ".") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    const numValue = parseFloat(displayValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
      // Format the display value to remove trailing dots
      setDisplayValue(numValue.toString());
    } else {
      // Invalid input - reset to previous value
      setDisplayValue(value !== undefined && value !== 0 ? value.toString() : "");
    }
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      min="0"
      step="0.5"
    />
  );
}
