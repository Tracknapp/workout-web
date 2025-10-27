export interface Exercise {
  _id: string;
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  bodyParts: string[];
  instructions: string[];
}

export interface FilterOption {
  _id: string;
  name: string;
}

export interface ExerciseSet {
  id: string; // Local ID for frontend
  setNumber: number;
  reps: number;
  weight?: number; // Optional, only for weight-based exercises (or distance for cardio)
  weightUnit?: "lbs" | "kgs"; // Weight unit for this set
  time?: string; // Time in hh:mm:ss format for cardio exercises
  distanceUnit?: "km" | "m"; // Distance unit for cardio exercises
  completed: boolean; // Track if set is done
}

export interface ExerciseWithSets extends Exercise {
  sets: ExerciseSet[];
}

export const PAGE_SIZE = 20;
