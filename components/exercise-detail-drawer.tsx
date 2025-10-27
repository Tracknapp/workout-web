"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { ExerciseWithSets } from "./exercise-browser/types";

interface ExerciseDetailDrawerProps {
  exercise: ExerciseWithSets | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExerciseDetailDrawer({
  exercise,
  open,
  onOpenChange,
}: ExerciseDetailDrawerProps) {
  // Fetch full exercise details from the database using exerciseId
  const fullExercise = useQuery(
    api.exercises.getExerciseByExerciseId,
    exercise && open ? { exerciseId: exercise.exerciseId } : "skip"
  );

  if (!exercise) return null;

  // Use full exercise data if available, otherwise fall back to the passed exercise
  const displayExercise = fullExercise || exercise;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 h-full flex flex-col overflow-hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>{displayExercise.name}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
              <h2 className="capitalize text-2xl font-semibold mb-6">{displayExercise.name}</h2>
              <div className="space-y-6">
          {/* Exercise GIF */}
          <div className="w-full flex items-center justify-center bg-muted rounded-lg border-2 border-border p-4">
            <img
              src={displayExercise.gifUrl}
              alt={displayExercise.name}
              className="max-w-sm w-auto h-auto"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Target Muscles */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Target Muscles
            </h3>
            <div className="flex flex-wrap gap-2">
              {displayExercise.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Secondary Muscles */}
          {displayExercise.secondaryMuscles && displayExercise.secondaryMuscles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                Secondary Muscles
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayExercise.secondaryMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm capitalize"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {displayExercise.equipments && displayExercise.equipments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                Equipment
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayExercise.equipments.map((equipment) => (
                  <span
                    key={equipment}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm capitalize"
                  >
                    {equipment}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Body Parts */}
          {displayExercise.bodyParts && displayExercise.bodyParts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                Body Parts
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayExercise.bodyParts.map((part) => (
                  <span
                    key={part}
                    className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm capitalize"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {displayExercise.instructions && displayExercise.instructions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Instructions
              </h3>
              <ul className="space-y-3">
                {displayExercise.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          )}
              </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
