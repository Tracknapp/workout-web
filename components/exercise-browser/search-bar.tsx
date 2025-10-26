"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export function SearchBar({
  searchQuery,
  hasFilters,
  onSearchChange,
  onClearFilters,
}: SearchBarProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-10 gap-1.5 shrink-0"
          >
            <RotateCcw className="size-3.5" />
            <span className="text-xs">Clear</span>
          </Button>
        )}
      </div>
    </div>
  );
}
