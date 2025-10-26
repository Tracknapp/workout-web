import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import type { ExerciseWithSets } from "@/components/exercise-browser/types";

interface UseWorkoutSessionProps {
  routineId: Id<"routines">;
}

interface UseWorkoutSessionReturn {
  sessionId: Id<"workoutSessions"> | null;
  routineName: string;
  exercises: ExerciseWithSets[];
  originalExercises: ExerciseWithSets[];
  isLoading: boolean;
  hasConflict: boolean;
  conflictingSession: { routineName: string; routineId: Id<"routines"> } | null;
  completeSession: () => Promise<void>;
  hasChanges: () => boolean;
}

export function useWorkoutSession({
  routineId,
}: UseWorkoutSessionProps): UseWorkoutSessionReturn {
  const [sessionId, setSessionId] = useState<Id<"workoutSessions"> | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [originalExercises, setOriginalExercises] = useState<ExerciseWithSets[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictingSession, setConflictingSession] = useState<{
    routineName: string;
    routineId: Id<"routines">;
  } | null>(null);

  const routine = useQuery(api.routines.getRoutineWithExercises, { routineId });
  const activeSession = useQuery(api.sessions.getActiveSession);
  const session = useQuery(
    api.sessions.getSessionWithExercises,
    sessionId ? { sessionId } : "skip"
  );

  const startSessionMutation = useMutation(api.sessions.startSession);
  const completeSessionMutation = useMutation(api.sessions.completeSession);

  // Start or restore session when page loads
  useEffect(() => {
    if (routine && !isLoaded && !isStartingSession && activeSession !== undefined) {
      const initSession = async () => {
        setIsStartingSession(true);
        try {
          // Check if there's an active session
          if (activeSession) {
            // If active session is for this routine, restore it
            if (activeSession.routineId === routineId) {
              setSessionId(activeSession._id);
            } else {
              // Active session exists for a different routine - prevent starting new session
              setHasConflict(true);
              if (activeSession.routineId) {
                setConflictingSession({
                  routineName: activeSession.routineName,
                  routineId: activeSession.routineId,
                });
              }
              setIsLoaded(true);
              setIsStartingSession(false);
              return;
            }
          } else {
            // No active session - start new session
            const newSessionId = await startSessionMutation({ routineId });
            setSessionId(newSessionId);
            toast.success("Workout session started!");
          }
        } catch (error) {
          console.error("Error starting session:", error);
          toast.error("Failed to start workout session");
        } finally {
          setIsStartingSession(false);
        }
      };

      initSession();
      setIsLoaded(true);
    }
  }, [routine, isLoaded, activeSession, routineId, startSessionMutation, isStartingSession]);

  // Load exercises from session when session data arrives
  useEffect(() => {
    if (session && sessionId) {
      const exercisesWithSets: ExerciseWithSets[] = session.exercises
        .map((se) => {
          return {
            _id: se._id,
            exerciseId: se.exerciseId,
            name: se.exerciseName,
            gifUrl: se.gifUrl,
            targetMuscles: se.targetMuscles,
            secondaryMuscles: [], // Not stored in session
            equipments: se.equipments,
            bodyParts: [], // Not stored in session
            instructions: [], // Not stored in session
            sets: se.sets.map((set) => ({
              id: set._id, // Session set ID
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              completed: set.completed,
            })),
          };
        })
        .filter(Boolean) as ExerciseWithSets[];

      setExercises(exercisesWithSets);

      // Store original exercises from the routine for comparison
      if (routine?.exercises && routine.exercises.length > 0) {
        const routineExercises: ExerciseWithSets[] = routine.exercises
          .map((re) => {
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
                completed: false,
              })),
            };
          })
          .filter(Boolean) as ExerciseWithSets[];
        setOriginalExercises(routineExercises);
      }
    }
  }, [session, sessionId, routine]);

  // Check if there are changes from original routine
  const hasChanges = (): boolean => {
    if (exercises.length !== originalExercises.length) return true;

    for (let i = 0; i < exercises.length; i++) {
      const current = exercises[i];
      const original = originalExercises[i];

      // Check if exercise is different
      if (current.exerciseId !== original.exerciseId) return true;

      // Check if sets are different
      if (current.sets.length !== original.sets.length) return true;

      for (let j = 0; j < current.sets.length; j++) {
        const currentSet = current.sets[j];
        const originalSet = original.sets[j];

        if (
          currentSet.reps !== originalSet.reps ||
          currentSet.weight !== originalSet.weight
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const completeSession = async () => {
    if (!sessionId) {
      toast.error("No active session found");
      return;
    }

    try {
      // Mark session as completed in database
      await completeSessionMutation({ sessionId });
      toast.success("Workout completed!");
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete workout");
      throw error;
    }
  };

  return {
    sessionId,
    routineName: routine?.name || "",
    exercises,
    originalExercises,
    isLoading: !isLoaded || isStartingSession,
    hasConflict,
    conflictingSession,
    completeSession,
    hasChanges,
  };
}
