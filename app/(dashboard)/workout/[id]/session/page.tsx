"use client";

import React, { use, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SessionExercisesList } from "@/components/session-exercises-list";
import { ExerciseDetailDrawer } from "@/components/exercise-detail-drawer";
import { ExerciseBrowser } from "@/components/exercise-browser";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReusableDialog } from "@/components/reusable-dialog";
import { ArrowLeft, Plus, CheckCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useRoutineExercises } from "@/hooks/useRoutineExercises";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { useSessionUpdates } from "@/hooks/useSessionUpdates";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import type {
  Exercise,
  ExerciseWithSets,
} from "@/components/exercise-browser/types";
import { toast } from "sonner";

export default function WorkoutSession({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const routineId = id as Id<"routines">;

  const [selectedExerciseForDetails, setSelectedExerciseForDetails] =
    useState<ExerciseWithSets | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const saveRoutineExercises = useMutation(api.routines.saveRoutineExercises);

  // Custom hooks for session and exercise management
  const {
    routineName,
    exercises,
    isLoading,
    completeSession: completeSessionFromHook,
    hasChanges,
  } = useWorkoutSession({ routineId });

  const {
    selectedExercises,
    setSelectedExercises,
    handleAddExercises: addExercises,
    handleAddSet,
    handleRemoveSet,
    handleUpdateSet: updateSetLocal,
    handleToggleComplete: toggleCompleteLocal,
    handleRemoveExercise,
  } = useRoutineExercises();

  const { handleToggleComplete, handleUpdateSet } = useSessionUpdates({
    exercises: selectedExercises,
    onToggleComplete: toggleCompleteLocal,
    onUpdateSet: updateSetLocal,
  });

  const { sensors, handleDragEnd } = useDragAndDrop(setSelectedExercises);

  // Sync exercises from session hook to selectedExercises
  useEffect(() => {
    if (exercises.length > 0) {
      setSelectedExercises(exercises);
    }
  }, [exercises, setSelectedExercises]);

  const handleAddExercisesToSession = (exercises: Exercise[]) => {
    addExercises(exercises);
    setIsDrawerOpen(false);
  };

  const handleViewExerciseDetails = (exercise: ExerciseWithSets) => {
    setSelectedExerciseForDetails(exercise);
    setIsDetailDrawerOpen(true);
  };

  const handleCompleteWorkout = () => {
    if (hasChanges()) {
      // Show dialog asking if they want to update the routine
      setUpdateDialogOpen(true);
    } else {
      // No changes, just complete the session
      handleCompleteSession();
    }
  };

  const handleUpdateRoutineAndComplete = async () => {
    try {
      // Update routine with new exercises and sets
      const exercisesToSave = selectedExercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        order: index,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
        })),
      }));

      await saveRoutineExercises({
        routineId,
        exercises: exercisesToSave,
      });

      toast.success("Routine updated successfully!");
      setUpdateDialogOpen(false);
      handleCompleteSession();
    } catch (error) {
      console.error("Error updating routine:", error);
      toast.error("Failed to update routine");
    }
  };

  const handleCompleteWithoutUpdate = () => {
    setUpdateDialogOpen(false);
    handleCompleteSession();
  };

  const handleCompleteSession = async () => {
    try {
      await completeSessionFromHook();
      router.push("/workout");
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (isLoading) {
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{routineName}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDrawerOpen(true)} variant="outline">
            <Plus className="size-4 mr-2" />
            Add Exercise
          </Button>
          <Button onClick={handleCompleteWorkout} variant="default">
            <CheckCircle className="size-4 mr-2" />
            Complete Workout
          </Button>
        </div>
      </div>

      {/* Exercises List */}
      <SessionExercisesList
        exercises={selectedExercises}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onRemoveExercise={handleRemoveExercise}
        onAddSet={handleAddSet}
        onRemoveSet={handleRemoveSet}
        onUpdateSet={handleUpdateSet}
        onToggleComplete={handleToggleComplete}
        onViewDetails={handleViewExerciseDetails}
      />

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
            <ExerciseBrowser onAddExercises={handleAddExercisesToSession} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Exercise Detail Drawer */}
      <ExerciseDetailDrawer
        exercise={selectedExerciseForDetails}
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      />

      {/* Update Routine Dialog */}
      <ReusableDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        title="Update Routine?"
        confirmText="Update Routine"
        cancelText="Don't Update"
        onConfirm={handleUpdateRoutineAndComplete}
        onCancel={handleCompleteWithoutUpdate}
      >
        <div className="text-sm">
          You made changes to the exercises or sets. Would you like to update
          the original routine with these changes?
        </div>
      </ReusableDialog>
    </div>
  );
}
