"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ExerciseBrowser } from "@/components/exercise-browser";
import { RoutineExerciseCard } from "@/components/routine-exercise-card";
import { ExerciseDetailDrawer } from "@/components/exercise-detail-drawer";
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
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useRoutineExercises } from "@/hooks/useRoutineExercises";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import type { Exercise, ExerciseWithSets } from "@/components/exercise-browser/types";
import { toast } from "sonner";

export default function RoutineDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const routineId = id as Id<"routines">;

  const routine = useQuery(api.routines.getRoutineWithExercises, { routineId });
  const updateRoutine = useMutation(api.routines.updateRoutine);
  const saveRoutineExercises = useMutation(api.routines.saveRoutineExercises);

  // Get user's preferred weight unit
  const userProfile = useQuery(api.user.getUserProfile);
  const weightUnit = userProfile?.weightUnit || "lbs";

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedExerciseForDetails, setSelectedExerciseForDetails] = useState<ExerciseWithSets | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Custom hooks for exercise management and drag-and-drop
  const {
    selectedExercises,
    setSelectedExercises,
    handleAddExercises: addExercises,
    handleAddSet,
    handleRemoveSet,
    handleUpdateSet,
    handleToggleComplete,
    handleRemoveExercise,
  } = useRoutineExercises();

  const { sensors, handleDragEnd } = useDragAndDrop(setSelectedExercises);

  // Update local state when routine data loads
  useEffect(() => {
    if (routine && !isLoaded) {
      setRoutineName(routine.name);

      // Load exercises with sets from backend
      if (routine.exercises && routine.exercises.length > 0) {
        const exercisesWithSets: ExerciseWithSets[] = routine.exercises.map((re) => {
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
            sets: re.sets.map((set) => ({
              id: set._id,
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              completed: false, // Backend doesn't store completed state for routines
            })),
          };
        }).filter(Boolean) as ExerciseWithSets[];

        setSelectedExercises(exercisesWithSets);
      }

      setIsLoaded(true);
    }
  }, [routine, isLoaded, setSelectedExercises]);

  const handleAddExercises = (exercises: Exercise[]) => {
    addExercises(exercises);
    setIsDrawerOpen(false); // Close drawer after adding
  };

  const handleViewExerciseDetails = (exercise: ExerciseWithSets) => {
    setSelectedExerciseForDetails(exercise);
    setIsDetailDrawerOpen(true);
  };

  const handleSaveRoutine = async () => {
    try {
      // Update routine name
      await updateRoutine({
        routineId,
        name: routineName,
      });

      // Save exercises with sets to database
      const exercisesToSave = selectedExercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        order: index,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          weightUnit,
        })),
      }));

      await saveRoutineExercises({
        routineId,
        exercises: exercisesToSave,
      });

      toast.success(`Routine "${routineName}" saved successfully!`);
    } catch (error) {
      console.error("Error saving routine:", error);
      toast.error("Failed to save routine. Please try again.");
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedExercises.map((ex) => ex._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {selectedExercises.map((exercise) => (
                  <RoutineExerciseCard
                    key={exercise._id}
                    exercise={exercise}
                    onRemoveExercise={() => handleRemoveExercise(exercise._id)}
                    onAddSet={() => handleAddSet(exercise._id)}
                    onRemoveSet={(setId) => handleRemoveSet(exercise._id, setId)}
                    onUpdateSet={(setId, field, value) =>
                      handleUpdateSet(exercise._id, setId, field, value)
                    }
                    onToggleComplete={(setId) =>
                      handleToggleComplete(exercise._id, setId)
                    }
                    onViewDetails={() => handleViewExerciseDetails(exercise)}
                    weightUnit={weightUnit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No exercises added yet. Click &quot;Add Exercise&quot; to get started.
          </p>
        </div>
      )}

      {/* Exercise Browser Drawer */}
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

      {/* Exercise Detail Drawer */}
      <ExerciseDetailDrawer
        exercise={selectedExerciseForDetails}
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      />
    </div>
  );
}
