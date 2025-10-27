import type { Exercise } from "./types";

// Equipment types that require weight tracking
const WEIGHT_EQUIPMENT = [
  "barbell",
  "olympic barbell",
  "ez barbell",
  "dumbbell",
  "kettlebell",
  "trap bar",
  "smith machine",
  "cable",
  "leverage machine",
  "sled machine",
  "weighted",
  "medicine ball",
  "hammer",
];

/**
 * Determines if an exercise requires weight tracking based on its equipment
 */
export function requiresWeight(exercise: Exercise): boolean {
  return exercise.equipments.some((equipment) =>
    WEIGHT_EQUIPMENT.includes(equipment.toLowerCase())
  );
}

/**
 * Determines if an exercise is cardio-based (should track distance instead of weight)
 */
export function isCardioExercise(exercise: Exercise): boolean {
  return exercise.targetMuscles.some((muscle) =>
    muscle.toLowerCase() === "cardio"
  );
}
