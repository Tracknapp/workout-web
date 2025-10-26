"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./types";

interface FilterDropdownProps {
  label: string;
  placeholder: string;
  emptyMessage: string;
  options: FilterOption[] | undefined;
  selectedValue: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function FilterDropdown({
  label,
  placeholder,
  emptyMessage,
  options,
  selectedValue,
  isOpen,
  onToggle,
  onSelect,
  onClose,
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const displayValue =
    selectedValue === "all"
      ? "All"
      : options?.find((o) => o.name === selectedValue)?.name;

  return (
    <div className="p-4">
      <label className="text-sm font-semibold mb-2 block">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
          onClick={onToggle}
        >
          <span className="capitalize">{displayValue}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
            <Command>
              <CommandInput placeholder={placeholder} />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      onSelect("all");
                      onClose();
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedValue === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All
                  </CommandItem>
                  {options?.map((option) => (
                    <CommandItem
                      key={option._id}
                      value={option.name}
                      onSelect={() => {
                        onSelect(option.name);
                        onClose();
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedValue === option.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="capitalize">{option.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
}
