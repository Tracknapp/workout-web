"use client";

import React, { use, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SessionExercisesList } from "@/components/session-exercises-list";
import { ExerciseDetailDrawer } from "@/components/exercise-detail-drawer";
import { ExerciseBrowser } from "@/components/exercise-browser";
import { WorkoutTimer } from "@/components/workout-timer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReusableDialog } from "@/components/reusable-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus, CheckCircle, Dumbbell, MoreVertical, XCircle } from "lucide-react";
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

  // Get user's preferred weight and distance units
  const userProfile = useQuery(api.user.getUserProfile);
  const weightUnit = userProfile?.weightUnit || "lbs";
  const distanceUnit = userProfile?.distanceUnit || "km";

  const [selectedExerciseForDetails, setSelectedExerciseForDetails] =
    useState<ExerciseWithSets | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false);

  const saveRoutineExercises = useMutation(api.routines.saveRoutineExercises);
  const abandonSessionMutation = useMutation(api.sessions.abandonSession);
  const addSetToExerciseMutation = useMutation(api.sessions.addSetToExercise);

  // Custom hooks for session and exercise management
  const {
    sessionId,
    routineName,
    exercises,
    isLoading,
    hasConflict,
    conflictingSession,
    completeSession: completeSessionFromHook,
    hasChanges,
    startTime,
  } = useWorkoutSession({ routineId });

  const {
    selectedExercises,
    setSelectedExercises,
    handleAddExercises: addExercises,
    handleAddSet: addSetLocal,
    handleRemoveSet,
    handleUpdateSet: updateSetLocal,
    handleToggleComplete: toggleCompleteLocal,
    handleRemoveExercise,
  } = useRoutineExercises();

  // Wrap handleAddSet to create the set in the database first
  const handleAddSet = async (exerciseId: string) => {
    try {
      // Find the exercise to get its session exercise ID
      const exercise = selectedExercises.find((ex) => ex._id === exerciseId);
      if (!exercise) return;

      const newSetNumber = exercise.sets.length + 1;

      // Create the set in the database and get the real ID
      const newSetId = await addSetToExerciseMutation({
        sessionExerciseId: exerciseId as Id<"sessionExercises">,
        setNumber: newSetNumber,
      });

      // Add the set to local state with the real database ID
      setSelectedExercises((prev) =>
        prev.map((ex) => {
          if (ex._id === exerciseId) {
            const isCardio = ex.targetMuscles.some((m) => m.toLowerCase() === "cardio");
            const newSet = {
              id: newSetId, // Use the real database ID
              setNumber: newSetNumber,
              reps: 0,
              weight: isCardio ? 0 : ex.sets[0]?.weight || 0,
              time: isCardio ? 0 : undefined, // Time in seconds
              completed: false,
            };
            return { ...ex, sets: [...ex.sets, newSet] };
          }
          return ex;
        })
      );
    } catch (error) {
      console.error("Error adding set:", error);
      toast.error("Failed to add set");
    }
  };

  const { handleToggleComplete, handleUpdateSet } = useSessionUpdates({
    exercises: selectedExercises,
    onToggleComplete: toggleCompleteLocal,
    onUpdateSet: updateSetLocal,
    weightUnit,
    distanceUnit,
  });

  const { sensors, handleDragEnd } = useDragAndDrop(setSelectedExercises);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Sync exercises from session hook to selectedExercises ONLY on initial load
  // Don't sync on every update to avoid overwriting optimistic updates
  useEffect(() => {
    if (exercises.length > 0 && !hasInitiallyLoaded) {
      setSelectedExercises(exercises);
      setHasInitiallyLoaded(true);
    }
  }, [exercises, setSelectedExercises, hasInitiallyLoaded]);

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
    } catch {
      // Error already handled in hook
    }
  };

  const handleAbandonSession = async () => {
    if (!sessionId) {
      toast.error("No active session found");
      return;
    }

    try {
      await abandonSessionMutation({ sessionId });
      toast.success("Workout session deleted");
      setAbandonDialogOpen(false);
      router.push("/workout");
    } catch (error) {
      console.error("Error abandoning session:", error);
      toast.error("Failed to delete workout session");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    );
  }

  // Show conflict UI if user tries to start a new session while one is active
  if (hasConflict && conflictingSession) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Cannot Start Session</h1>
        </div>
        <div className="border rounded-lg p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold">Active Workout in Progress</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              You have an active workout session for{" "}
              <span className="font-semibold">{conflictingSession.routineName}</span>.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Please complete or abandon your current session before starting a new one.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button variant="outline" onClick={() => router.push("/workout")} className="w-full sm:w-auto">
              Back to Routines
            </Button>
            <Button
              onClick={() => router.push(`/workout/${conflictingSession.routineId}/session`)}
              className="w-full sm:w-auto"
            >
              Go to Active Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{routineName}</h1>
            <WorkoutTimer startTime={startTime} />
          </div>
        </div>
        {/* Desktop Actions */}
        <div className="hidden sm:flex gap-2">
          <Button onClick={() => setIsDrawerOpen(true)} variant="outline">
            <Plus className="size-4 mr-2" />
            Add Exercise
          </Button>
          <Button onClick={handleCompleteWorkout} variant="default">
            <CheckCircle className="size-4 mr-2" />
            Complete Workout
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setAbandonDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="size-4 mr-2" />
                Abandon Workout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t p-4 z-40 shadow-lg">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsDrawerOpen(true)}
            variant="outline"
            className="flex-1"
          >
            <Plus className="size-4 mr-2" />
            Add Exercise
          </Button>
          <Button
            onClick={handleCompleteWorkout}
            variant="default"
            className="flex-1"
          >
            <CheckCircle className="size-4 mr-2" />
            Complete
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
              <DropdownMenuItem
                onClick={() => setAbandonDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="size-4 mr-2" />
                Abandon Workout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        weightUnit={weightUnit}
        distanceUnit={distanceUnit}
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

      {/* Abandon Session Dialog */}
      <ReusableDialog
        open={abandonDialogOpen}
        onOpenChange={setAbandonDialogOpen}
        title="Abandon Workout?"
        confirmText="Abandon Workout"
        cancelText="Cancel"
        onConfirm={handleAbandonSession}
        onCancel={() => setAbandonDialogOpen(false)}
      >
        <div className="text-sm">
          Are you sure you want to abandon this workout session? All progress will be permanently deleted.
        </div>
      </ReusableDialog>
    </div>
  );
}
