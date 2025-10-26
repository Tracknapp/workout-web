"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Exercise } from "./types";

interface ExerciseListProps {
  exercises: Exercise[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isDone: boolean;
  selectedExercises: Set<string>;
  onLoadMore: () => void;
  onToggleExercise: (exerciseId: string) => void;
}

export function ExerciseList({
  exercises,
  isLoading,
  isLoadingMore,
  isDone,
  selectedExercises,
  onLoadMore,
  onToggleExercise,
}: ExerciseListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isDone && !isLoadingMore) {
          onLoadMore();
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
  }, [isDone, isLoadingMore, onLoadMore]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-3">
            Exercises{" "}
            {exercises.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({exercises.length})
              </span>
            )}
          </h3>

          {/* Exercises List */}
          <div className="flex flex-col gap-3">
            {/* Initial Loading State */}
            {isLoading && exercises.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Loading...
              </div>
            )}

            {/* Empty State */}
            {!isLoading && exercises.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No exercises found
              </div>
            )}

            {/* Render exercises */}
            {exercises.map((exercise) => {
              const isSelected = selectedExercises.has(exercise._id);
              return (
                <div
                  key={exercise._id}
                  onClick={() => onToggleExercise(exercise._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer ${
                    isSelected ? "bg-accent" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleExercise(exercise._id)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />

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
              );
            })}

            {/* Infinite Scroll Sentinel */}
            {exercises.length > 0 && (
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
