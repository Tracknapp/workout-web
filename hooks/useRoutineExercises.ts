import { useState } from "react";
import type {
  Exercise,
  ExerciseWithSets,
  ExerciseSet,
} from "@/components/exercise-browser/types";
import { requiresWeight } from "@/components/exercise-browser/utils";

export function useRoutineExercises() {
  const [selectedExercises, setSelectedExercises] = useState<
    ExerciseWithSets[]
  >([]);

  const handleAddExercises = (exercises: Exercise[]) => {
    setSelectedExercises((prev) => {
      // Add new exercises with empty sets array, avoiding duplicates
      const existingIds = new Set(prev.map((ex) => ex._id));
      const newExercises: ExerciseWithSets[] = exercises
        .filter((ex) => !existingIds.has(ex._id))
        .map((ex) => ({
          ...ex,
          sets: [], // Initialize with empty sets
        }));
      return [...prev, ...newExercises];
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex._id === exerciseId) {
          const newSet: ExerciseSet = {
            id: `${exerciseId}-${Date.now()}`, // Generate unique ID
            setNumber: ex.sets.length + 1,
            reps: 0,
            weight: requiresWeight(ex) ? 0 : undefined,
            completed: false,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex._id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.filter((set) => set.id !== setId),
          };
        }
        return ex;
      })
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: number
  ) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex._id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          };
        }
        return ex;
      })
    );
  };

  const handleToggleComplete = (exerciseId: string, setId: string) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex._id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) =>
              set.id === setId ? { ...set, completed: !set.completed } : set
            ),
          };
        }
        return ex;
      })
    );
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.filter((ex) => ex._id !== exerciseId)
    );
  };

  return {
    selectedExercises,
    setSelectedExercises,
    handleAddExercises,
    handleAddSet,
    handleRemoveSet,
    handleUpdateSet,
    handleToggleComplete,
    handleRemoveExercise,
  };
}
