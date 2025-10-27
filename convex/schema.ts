import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const User = {
  email: v.string(),
  clerkId: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  profilePicture: v.optional(v.string()),
  gender: v.optional(v.string()),
  weightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kgs"))),
};

export const BodyPart = {
  name: v.string(),
};

export const Equipment = {
  name: v.string(),
};

export const Muscle = {
  name: v.string(),
};

export const Exercise = {
  exerciseId: v.string(),
  name: v.string(),
  gifUrl: v.string(),
  targetMuscles: v.array(v.string()),
  bodyParts: v.array(v.string()),
  equipments: v.array(v.string()),
  secondaryMuscles: v.array(v.string()),
  instructions: v.array(v.string()),
};

export const Routine = {
  name: v.string(),
  userId: v.id("users"),
};

export const RoutineExercise = {
  routineId: v.id("routines"),
  exerciseId: v.string(), // References Exercise.exerciseId
  order: v.number(),
  notes: v.optional(v.string()),
};

export const RoutineExerciseSet = {
  routineExerciseId: v.id("routineExercises"),
  setNumber: v.number(),
  reps: v.number(),
  weight: v.optional(v.number()), // Optional, only for weight-based exercises
  weightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kgs"))),
};

// Workout Session schemas - independent of routines for historical tracking
export const WorkoutSession = {
  userId: v.id("users"),
  routineName: v.string(),
  routineId: v.optional(v.id("routines")),
  startTime: v.number(),
  endTime: v.optional(v.number()),
  status: v.union(
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("abandoned")
  ),
};

export const SessionExercise = {
  sessionId: v.id("workoutSessions"),
  exerciseId: v.string(), // References Exercise.exerciseId
  exerciseName: v.string(), // Snapshot of exercise name (preserved)
  order: v.number(),
  // Store exercise details for historical record
  targetMuscles: v.array(v.string()),
  equipments: v.array(v.string()),
  gifUrl: v.string(),
};

export const SessionSet = {
  sessionExerciseId: v.id("sessionExercises"),
  setNumber: v.number(),
  reps: v.number(),
  weight: v.optional(v.number()),
  weightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kgs"))),
  completed: v.boolean(),
  completedAt: v.optional(v.number()), // Unix timestamp when set was completed
};

export default defineSchema({
  users: defineTable(User)
    .index("byClerkId", ["clerkId"])
    .index("byEmail", ["email"]),
  bodyParts: defineTable(BodyPart).index("byName", ["name"]),
  equipments: defineTable(Equipment).index("byName", ["name"]),
  muscles: defineTable(Muscle).index("byName", ["name"]),
  exercises: defineTable(Exercise)
    .index("byExerciseId", ["exerciseId"])
    .index("byName", ["name"]),
  routines: defineTable(Routine).index("byUserId", ["userId"]),
  routineExercises: defineTable(RoutineExercise)
    .index("byRoutineId", ["routineId"])
    .index("byExerciseId", ["exerciseId"]),
  routineExerciseSets: defineTable(RoutineExerciseSet).index(
    "byRoutineExerciseId",
    ["routineExerciseId"]
  ),
  // Workout session tables
  workoutSessions: defineTable(WorkoutSession)
    .index("byUserId", ["userId"])
    .index("byRoutineId", ["routineId"])
    .index("byStatus", ["status"]),
  sessionExercises: defineTable(SessionExercise).index("bySessionId", [
    "sessionId",
  ]),
  sessionSets: defineTable(SessionSet).index("bySessionExerciseId", [
    "sessionExerciseId",
  ]),
});
