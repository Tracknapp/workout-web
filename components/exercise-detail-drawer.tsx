"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  if (!exercise) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="capitalize text-2xl">{exercise.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Exercise GIF */}
          <div className="w-full rounded-lg overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="w-full h-auto"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          {/* Target Muscles */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Target Muscles
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.targetMuscles.map((muscle) => (
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
          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                Secondary Muscles
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.secondaryMuscles.map((muscle) => (
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
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Equipment
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.equipments.map((equipment) => (
                <span
                  key={equipment}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm capitalize"
                >
                  {equipment}
                </span>
              ))}
            </div>
          </div>

          {/* Body Parts */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Body Parts
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.bodyParts.map((part) => (
                <span
                  key={part}
                  className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm capitalize"
                >
                  {part}
                </span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Instructions
              </h3>
              <ul className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
