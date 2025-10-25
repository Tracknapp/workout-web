"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Loader2 } from "lucide-react";

const PAGE_SIZE = 20;

export function ExerciseBrowser() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [isDone, setIsDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch all data
  const musclesData = useQuery(api.exercises.getAllMuscles);
  const equipmentsData = useQuery(api.exercises.getAllEquipments);

  // Sort alphabetically and memoize
  const muscles = useMemo(
    () => musclesData?.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [musclesData]
  );
  const equipments = useMemo(
    () =>
      equipmentsData?.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [equipmentsData]
  );

  // Fetch filtered exercises with offset-based pagination
  const exercisesData = useQuery(api.exercises.getFilteredExercises, {
    muscles: selectedMuscle !== "all" ? [selectedMuscle] : undefined,
    equipments: selectedEquipment !== "all" ? [selectedEquipment] : undefined,
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
    setAllExercises([]);
    setOffset(0);
    setIsDone(false);
    setIsLoadingMore(false);
  };

  const hasFilters = selectedMuscle !== "all" || selectedEquipment !== "all";

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Equipment Dropdown */}
        <div className="p-4">
          <label className="text-sm font-semibold mb-2 block">Equipment</label>
          <Select value={selectedEquipment} onValueChange={handleEquipmentChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {equipments?.map((equipment) => (
                <SelectItem key={equipment._id} value={equipment.name}>
                  <span className="capitalize">{equipment.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Muscles Dropdown */}
        <div className="p-4">
          <label className="text-sm font-semibold mb-2 block">Muscles</label>
          <Select value={selectedMuscle} onValueChange={handleMuscleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select muscle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {muscles?.map((muscle) => (
                <SelectItem key={muscle._id} value={muscle.name}>
                  <span className="capitalize">{muscle.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Exercises Section */}
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
  );
}
