"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ExerciseBrowser } from "@/components/exercise-browser";
import { RoutineExerciseCard } from "@/components/routine-exercise-card";
import type {
  Exercise,
  ExerciseWithSets,
  ExerciseSet,
} from "@/components/exercise-browser/types";
import { requiresWeight } from "@/components/exercise-browser/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Save } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function RoutineDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const routineId = id as Id<"routines">;

  const routine = useQuery(api.routines.getRoutine, { routineId });
  const updateRoutine = useMutation(api.routines.updateRoutine);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<
    ExerciseWithSets[]
  >([]);
  const [routineName, setRoutineName] = useState("");

  // Update local state when routine data loads
  useEffect(() => {
    if (routine) {
      setRoutineName(routine.name);
    }
  }, [routine]);

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
    setIsDrawerOpen(false); // Close drawer after adding
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

  const handleSaveRoutine = async () => {
    try {
      // Update routine name
      await updateRoutine({
        routineId,
        name: routineName,
      });

      // TODO: Save exercises to database
      console.log("Saving exercises to routine:", selectedExercises);
      alert(`Routine "${routineName}" saved successfully!`);
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Failed to save routine");
    }
  };

  if (!routine) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading routine...</p>
        </div>
      </div>
    );
  }

  const hasChanges =
    routineName !== routine.name ||
    selectedExercises.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <Input
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          className="text-2xl font-bold border-none px-3 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
          placeholder="Enter routine name..."
        />
        <div className="flex gap-2 shrink-0">
          {hasChanges && (
            <Button onClick={handleSaveRoutine} variant="default">
              <Save className="size-4 mr-2" />
              Save
            </Button>
          )}
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="size-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      </div>

      {/* Selected Exercises List */}
      {selectedExercises.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Selected Exercises ({selectedExercises.length})
          </h2>
          <div className="grid gap-4">
            {selectedExercises.map((exercise) => (
              <RoutineExerciseCard
                key={exercise._id}
                exercise={exercise}
                onRemoveExercise={() =>
                  setSelectedExercises((prev) =>
                    prev.filter((ex) => ex._id !== exercise._id)
                  )
                }
                onAddSet={() => handleAddSet(exercise._id)}
                onRemoveSet={(setId) => handleRemoveSet(exercise._id, setId)}
                onUpdateSet={(setId, field, value) =>
                  handleUpdateSet(exercise._id, setId, field, value)
                }
                onToggleComplete={(setId) =>
                  handleToggleComplete(exercise._id, setId)
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No exercises added yet. Click "Add Exercise" to get started.
          </p>
        </div>
      )}

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 h-full flex flex-col"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Add Exercise</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0">
            <ExerciseBrowser onAddExercises={handleAddExercises} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
