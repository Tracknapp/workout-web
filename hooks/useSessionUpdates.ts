import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import type { ExerciseWithSets } from "@/components/exercise-browser/types";

interface UseSessionUpdatesProps {
  exercises: ExerciseWithSets[];
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight" | "time",
    value: number | string
  ) => void;
  weightUnit?: "lbs" | "kgs";
  distanceUnit?: "km" | "m";
}

interface UseSessionUpdatesReturn {
  handleToggleComplete: (exerciseId: string, setId: string) => Promise<void>;
  handleUpdateSet: (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight" | "time",
    value: number | string
  ) => Promise<void>;
}

export function useSessionUpdates({
  exercises,
  onToggleComplete,
  onUpdateSet,
  weightUnit = "lbs",
  distanceUnit = "km",
}: UseSessionUpdatesProps): UseSessionUpdatesReturn {
  const toggleSetCompletionMutation = useMutation(api.sessions.toggleSetCompletion);
  const updateSetValuesMutation = useMutation(api.sessions.updateSetValues);

  const handleToggleComplete = async (exerciseId: string, setId: string) => {
    // Find the set to get its current completed status BEFORE updating
    const exercise = exercises.find((ex) => ex._id === exerciseId);
    const set = exercise?.sets.find((s) => s.id === setId);

    if (!set) return;

    const newCompletedStatus = !set.completed;

    // Update local state first
    onToggleComplete(exerciseId, setId);

    try {
      // Save new completion status to database
      await toggleSetCompletionMutation({
        setId: setId as Id<"sessionSets">,
        completed: newCompletedStatus,
      });
    } catch (error) {
      console.error("Error toggling set completion:", error);
      toast.error("Failed to save set completion");
      // Revert local state on error
      onToggleComplete(exerciseId, setId);
    }
  };

  const handleUpdateSet = async (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight" | "time",
    value: number | string
  ) => {
    try {
      // Find the set to get current values BEFORE updating local state
      const exercise = exercises.find((ex) => ex._id === exerciseId);
      const set = exercise?.sets.find((s) => s.id === setId);

      if (set) {
        // Update in database with all values
        await updateSetValuesMutation({
          setId: setId as Id<"sessionSets">,
          reps: field === "reps" ? (value as number) : (set.reps || 0),
          weight: field === "weight" ? (value as number) : set.weight,
          weightUnit: weightUnit,
          time: field === "time" ? (value as string) : set.time,
          distanceUnit: distanceUnit,
        });
      }

      // Update local state after successful database update
      onUpdateSet(exerciseId, setId, field, value);
    } catch (error) {
      console.error("Error updating set:", error);
      toast.error("Failed to save set update");
    }
  };

  return {
    handleToggleComplete,
    handleUpdateSet,
  };
}
