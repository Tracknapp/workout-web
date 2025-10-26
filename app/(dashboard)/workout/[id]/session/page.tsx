"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoutineExerciseCard } from "@/components/routine-exercise-card";
import { ExerciseDetailDrawer } from "@/components/exercise-detail-drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import type { ExerciseWithSets } from "@/components/exercise-browser/types";

export default function WorkoutSession({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const routineId = id as Id<"routines">;

  const routine = useQuery(api.routines.getRoutineWithExercises, { routineId });

  const [selectedExerciseForDetails, setSelectedExerciseForDetails] = useState<ExerciseWithSets | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const handleViewExerciseDetails = (exercise: ExerciseWithSets) => {
    setSelectedExerciseForDetails(exercise);
    setIsDetailDrawerOpen(true);
  };

  // Convert backend data to ExerciseWithSets format
  const exercises: ExerciseWithSets[] = routine?.exercises
    ? routine.exercises.map((re: any) => {
        if (!re.exercise) return null;

        return {
          _id: re.exercise._id,
          exerciseId: re.exercise.exerciseId,
          name: re.exercise.name,
          gifUrl: re.exercise.gifUrl,
          targetMuscles: re.exercise.targetMuscles,
          secondaryMuscles: re.exercise.secondaryMuscles,
          equipments: re.exercise.equipments,
          bodyParts: re.exercise.bodyParts,
          instructions: re.exercise.instructions,
          sets: re.sets.map((set: any) => ({
            id: set._id,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            completed: false, // Start with all sets incomplete
          })),
        };
      }).filter(Boolean) as ExerciseWithSets[]
    : [];

  if (!routine) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{routine.name}</h1>
        </div>
      </div>

      {/* Exercises List */}
      {exercises.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Exercises ({exercises.length})
          </h2>
          <div className="grid gap-4">
            {exercises.map((exercise) => (
              <RoutineExerciseCard
                key={exercise._id}
                exercise={exercise}
                onRemoveExercise={() => {}} // No remove in session mode
                onAddSet={() => {}} // No add set in session mode
                onRemoveSet={() => {}} // No remove set in session mode
                onUpdateSet={() => {}} // No update in session mode
                onToggleComplete={() => {}} // TODO: Implement completion tracking
                onViewDetails={() => handleViewExerciseDetails(exercise)}
                showComplete={true} // Show complete checkbox in workout session
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No exercises in this routine. Add exercises to get started.
          </p>
        </div>
      )}

      {/* Exercise Detail Drawer */}
      <ExerciseDetailDrawer
        exercise={selectedExerciseForDetails}
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      />
    </div>
  );
}
