"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader2, Search, Check, ChevronsUpDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function ExerciseBrowser() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [muscleOpen, setMuscleOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [isDone, setIsDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const equipmentRef = useRef<HTMLDivElement>(null);
  const muscleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        equipmentRef.current &&
        !equipmentRef.current.contains(event.target as Node)
      ) {
        setEquipmentOpen(false);
      }
      if (
        muscleRef.current &&
        !muscleRef.current.contains(event.target as Node)
      ) {
        setMuscleOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all data
  const musclesData = useQuery(api.exercises.getAllMuscles);
  const equipmentsData = useQuery(api.exercises.getAllEquipments);

  // Sort alphabetically and memoize
  const muscles = useMemo(
    () => musclesData?.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [musclesData]
  );
  const equipments = useMemo(
    () => equipmentsData?.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [equipmentsData]
  );

  // Fetch filtered exercises with offset-based pagination
  const exercisesData = useQuery(api.exercises.getFilteredExercises, {
    muscles: selectedMuscle !== "all" ? [selectedMuscle] : undefined,
    equipments: selectedEquipment !== "all" ? [selectedEquipment] : undefined,
    search: searchQuery.trim().length > 0 ? searchQuery : undefined,
    limit: PAGE_SIZE,
    offset: offset,
  });

  // Handle data updates
  useEffect(() => {
    if (!exercisesData) return;

    if (offset === 0) {
      // Initial load or filter changed
      setAllExercises(exercisesData.exercises);
    } else {
      // Loading more - append to existing
      if (exercisesData.exercises.length > 0) {
        setAllExercises((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((e) => e._id));
          const newExercises = exercisesData.exercises.filter(
            (e) => !existingIds.has(e._id)
          );
          return [...prev, ...newExercises];
        });
      }
    }

    setIsDone(exercisesData.isDone);
    setIsLoadingMore(false);
  }, [exercisesData]);

  const handleClearFilters = () => {
    setSelectedMuscle("all");
    setSelectedEquipment("all");
    setSearchQuery("");
    setAllExercises([]);
    setOffset(0);
    setIsDone(false);
    setIsLoadingMore(false);
  };

  const hasFilters =
    selectedMuscle !== "all" ||
    selectedEquipment !== "all" ||
    searchQuery.trim().length > 0;

  // Reset when filters change
  const handleMuscleChange = (value: string) => {
    setSelectedMuscle(value);
    setAllExercises([]);
    setOffset(0);
    setIsDone(false);
    setIsLoadingMore(false);
  };

  const handleEquipmentChange = (value: string) => {
    setSelectedEquipment(value);
    setAllExercises([]);
    setOffset(0);
    setIsDone(false);
    setIsLoadingMore(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setAllExercises([]);
    setOffset(0);
    setIsDone(false);
    setIsLoadingMore(false);
  };

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isDone && !isLoadingMore) {
          setIsLoadingMore(true);
          setOffset((prev) => prev + PAGE_SIZE);
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isDone, isLoadingMore, offset, allExercises.length]);

  return (
    <div className="flex flex-col h-full border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Exercise Library</h2>
      </div>

      {/* Search Bar - Fixed */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-10 gap-1.5 shrink-0"
            >
              <RotateCcw className="size-3.5" />
              <span className="text-xs">Clear</span>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Equipment Dropdown - Fixed */}
      <div className="p-4">
        <label className="text-sm font-semibold mb-2 block">Equipment</label>
        <div className="relative" ref={equipmentRef}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={equipmentOpen}
            className="w-full justify-between"
            onClick={() => setEquipmentOpen(!equipmentOpen)}
          >
            <span className="capitalize">
              {selectedEquipment === "all"
                ? "All"
                : equipments?.find((e) => e.name === selectedEquipment)?.name}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
          {equipmentOpen && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
              <Command>
                <CommandInput placeholder="Search equipment..." />
                <CommandList>
                  <CommandEmpty>No equipment found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        handleEquipmentChange("all");
                        setEquipmentOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedEquipment === "all"
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      All
                    </CommandItem>
                    {equipments?.map((equipment) => (
                      <CommandItem
                        key={equipment._id}
                        value={equipment.name}
                        onSelect={() => {
                          handleEquipmentChange(equipment.name);
                          setEquipmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            selectedEquipment === equipment.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="capitalize">{equipment.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Muscles Dropdown - Fixed */}
      <div className="p-4">
        <label className="text-sm font-semibold mb-2 block">Muscles</label>
        <div className="relative" ref={muscleRef}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={muscleOpen}
            className="w-full justify-between"
            onClick={() => setMuscleOpen(!muscleOpen)}
          >
            <span className="capitalize">
              {selectedMuscle === "all"
                ? "All"
                : muscles?.find((m) => m.name === selectedMuscle)?.name}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
          {muscleOpen && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
              <Command>
                <CommandInput placeholder="Search muscles..." />
                <CommandList>
                  <CommandEmpty>No muscle found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        handleMuscleChange("all");
                        setMuscleOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedMuscle === "all"
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      All
                    </CommandItem>
                    {muscles?.map((muscle) => (
                      <CommandItem
                        key={muscle._id}
                        value={muscle.name}
                        onSelect={() => {
                          handleMuscleChange(muscle.name);
                          setMuscleOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            selectedMuscle === muscle.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="capitalize">{muscle.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Exercises Section - Scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
          <h3 className="text-sm font-semibold mb-3">
            Exercises{" "}
            {allExercises.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({allExercises.length})
              </span>
            )}
          </h3>

          {/* Exercises List */}
          <div className="flex flex-col gap-3">
            {/* Initial Loading State - only show when no exercises loaded yet */}
            {!exercisesData && allExercises.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Loading...
              </div>
            )}

            {/* Empty State */}
            {exercisesData && allExercises.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No exercises found
              </div>
            )}

            {/* Render exercises */}
            {allExercises.map((exercise) => (
              <div
                key={exercise._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                {/* Circular GIF */}
                <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-muted border-2 border-border">
                  <img
                    src={exercise.gifUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Exercise Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm capitalize truncate">
                    {exercise.name}
                  </h4>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {exercise.targetMuscles.join(", ")}
                  </p>
                </div>
              </div>
            ))}

            {/* Infinite Scroll Sentinel */}
            {allExercises.length > 0 && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-4"
              >
                {isLoadingMore && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        </div>
        </ScrollArea>
      </div>
    </div>
  );
}
