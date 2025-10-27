"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeInput } from "@/components/time-input";
import { DistanceInput } from "@/components/distance-input";
import { WeightInput } from "@/components/weight-input";
import { Plus, Trash2, TrashIcon, Check, GripVertical } from "lucide-react";
import type { ExerciseWithSets } from "./exercise-browser/types";
import { requiresWeight, isCardioExercise } from "./exercise-browser/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RoutineExerciseCardProps {
  exercise: ExerciseWithSets;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: "reps" | "weight" | "time", value: number | string) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onViewDetails: () => void;
  showComplete?: boolean; // Show complete checkbox (for workout mode)
  weightUnit?: "lbs" | "kgs"; // User's preferred weight unit
  distanceUnit?: "km" | "m"; // User's preferred distance unit
}

export function RoutineExerciseCard({
  exercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleComplete,
  onViewDetails,
  showComplete = false,
  weightUnit = "lbs",
  distanceUnit = "km",
}: RoutineExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const needsWeight = requiresWeight(exercise);
  const isCardio = isCardioExercise(exercise);
  const showWeightOrDistance = needsWeight || isCardio;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-card overflow-hidden transition-shadow ${
        isDragging ? "shadow-lg opacity-50" : ""
      }`}
    >
      {/* Exercise Header */}
      <div className="flex items-center gap-4 p-4 bg-muted/50">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="size-5 text-muted-foreground" />
        </div>

        {/* Clickable Exercise Info Area */}
        <div
          onClick={onViewDetails}
          className="flex items-center gap-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity rounded-md p-2 -m-2"
        >
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
            {/* Header Row */}
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase w-8 text-center">
                Set
              </span>
              {isCardio ? (
                <div className="w-32">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Time (hh:mm:ss)
                  </span>
                </div>
              ) : (
                <div className="w-32">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Reps
                  </span>
                </div>
              )}
              {showWeightOrDistance && (
                <div className="w-32">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {isCardio ? `Distance (${distanceUnit})` : `Weight (${weightUnit})`}
                  </span>
                </div>
              )}
              <div className="ml-auto" style={{ width: showComplete ? '80px' : '40px' }}>
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </span>
              </div>
            </div>

            {/* Sets Rows */}
            {exercise.sets.map((set, index) => {
              // Validate if set can be completed
              const hasTimeOrReps = isCardio ? (set.time && set.time.length > 0) : set.reps > 0;
              const hasWeightOrDistance = showWeightOrDistance ? (set.weight ?? 0) > 0 : true;
              const isValid = hasTimeOrReps && hasWeightOrDistance;

              return (
                <div
                  key={set.id}
                  className={`flex items-center gap-2 p-2 border rounded-md transition-colors ${
                    set.completed
                      ? "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800"
                      : "bg-muted/50"
                  }`}
                >
                  <span className="text-sm font-medium w-8 h-8 border flex items-center justify-center rounded">
                    {index + 1}
                  </span>

                  {/* Time/Reps Input */}
                  {isCardio ? (
                    <TimeInput
                      placeholder="00:00:00"
                      value={set.time || ""}
                      onChange={(value) =>
                        onUpdateSet(
                          exercise._id,
                          set.id,
                          "time",
                          value
                        )
                      }
                      className="h-8 w-32"
                    />
                  ) : (
                    <Input
                      type="number"
                      placeholder="0"
                      value={set.reps || ""}
                      onChange={(e) =>
                        onUpdateSet(
                          exercise._id,
                          set.id,
                          "reps",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8 w-32"
                      min="0"
                    />
                  )}

                  {/* Weight/Distance Input (conditional) */}
                  {showWeightOrDistance && (
                    <>
                      {isCardio ? (
                        <DistanceInput
                          placeholder="0"
                          value={set.weight}
                          onChange={(value) =>
                            onUpdateSet(
                              exercise._id,
                              set.id,
                              "weight",
                              value
                            )
                          }
                          className="h-8 w-32"
                        />
                      ) : (
                        <WeightInput
                          placeholder="0"
                          value={set.weight}
                          onChange={(value) =>
                            onUpdateSet(
                              exercise._id,
                              set.id,
                              "weight",
                              value
                            )
                          }
                          className="h-8 w-32"
                        />
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-auto">
                    {/* Complete Button - Only show in workout mode */}
                    {showComplete && (
                      <Button
                        variant={set.completed ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onToggleComplete(exercise._id, set.id)}
                        disabled={!isValid && !set.completed}
                        className="h-8 w-8 p-0"
                        title={
                          !isValid && !set.completed
                            ? showWeightOrDistance
                              ? isCardio
                                ? "Enter time and distance to complete"
                                : "Enter reps and weight to complete"
                              : isCardio
                              ? "Enter time to complete"
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
                    )}

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
