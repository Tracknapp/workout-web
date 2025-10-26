"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, TrashIcon, Check } from "lucide-react";
import type { ExerciseWithSets } from "./exercise-browser/types";
import { requiresWeight } from "./exercise-browser/utils";

interface RoutineExerciseCardProps {
  exercise: ExerciseWithSets;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, field: "reps" | "weight", value: number) => void;
  onToggleComplete: (setId: string) => void;
}

export function RoutineExerciseCard({
  exercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleComplete,
}: RoutineExerciseCardProps) {
  const needsWeight = requiresWeight(exercise);

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Exercise Header */}
      <div className="flex items-center gap-4 p-4 bg-muted/50">
        {/* Circular GIF */}
        <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-border">
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Exercise Info */}
        <div className="flex-1">
          <h3 className="font-semibold capitalize">{exercise.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {exercise.targetMuscles.join(", ")}
          </p>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            Equipment: {exercise.equipments.join(", ")}
          </p>
        </div>

        {/* Remove Exercise Button */}
        <Button variant="ghost" size="sm" onClick={onRemoveExercise}>
          <TrashIcon className="size-4 text-destructive" />
        </Button>
      </div>

      {/* Sets Section */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Sets</h4>
          <Button
            onClick={onAddSet}
            variant="outline"
            size="sm"
            className="h-8"
          >
            <Plus className="size-3 mr-1" />
            Add Set
          </Button>
        </div>

        {exercise.sets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sets added yet</p>
        ) : (
          <div className="space-y-2">
            {exercise.sets.map((set, index) => {
              // Validate if set can be completed
              const hasReps = set.reps > 0;
              const hasWeight = needsWeight ? (set.weight ?? 0) > 0 : true;
              const isValid = hasReps && hasWeight;

              return (
                <div
                  key={set.id}
                  className={`flex items-center gap-2 p-2 border rounded-md transition-colors ${
                    set.completed
                      ? "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800"
                      : "bg-muted/50"
                  }`}
                >
                  <span className="text-sm font-medium w-12">
                    Set {index + 1}
                  </span>

                {/* Reps Input */}
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={set.reps || ""}
                    onChange={(e) =>
                      onUpdateSet(set.id, "reps", parseInt(e.target.value) || 0)
                    }
                    className="h-8 w-20"
                    min="0"
                  />
                  <span className="text-xs text-muted-foreground">reps</span>
                </div>

                {/* Weight Input (conditional) */}
                {needsWeight && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="Weight"
                      value={set.weight || ""}
                      onChange={(e) =>
                        onUpdateSet(
                          set.id,
                          "weight",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8 w-20"
                      min="0"
                    />
                    <span className="text-xs text-muted-foreground">lbs</span>
                  </div>
                )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-auto">
                    {/* Complete Button */}
                    <Button
                      variant={set.completed ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onToggleComplete(set.id)}
                      disabled={!isValid && !set.completed}
                      className="h-8 w-8 p-0"
                      title={
                        !isValid && !set.completed
                          ? needsWeight
                            ? "Enter reps and weight to complete"
                            : "Enter reps to complete"
                          : set.completed
                          ? "Mark as incomplete"
                          : "Mark as complete"
                      }
                    >
                      <Check
                        className={`size-4 ${
                          set.completed
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>

                    {/* Remove Set Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSet(set.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
