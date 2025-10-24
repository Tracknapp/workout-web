import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const User = {
  email: v.string(),
  clerkId: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  profilePicture: v.optional(v.string()),
  gender: v.optional(v.string()),
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

export default defineSchema({
  users: defineTable(User)
    .index("byClerkId", ["clerkId"])
    .index("byEmail", ["email"]),
  bodyParts: defineTable(BodyPart)
    .index("byName", ["name"]),
  equipments: defineTable(Equipment)
    .index("byName", ["name"]),
  muscles: defineTable(Muscle)
    .index("byName", ["name"]),
  exercises: defineTable(Exercise)
    .index("byExerciseId", ["exerciseId"])
    .index("byName", ["name"]),
  routines: defineTable(Routine)
    .index("byUserId", ["userId"]),
  routineExercises: defineTable(RoutineExercise)
    .index("byRoutineId", ["routineId"])
    .index("byExerciseId", ["exerciseId"]),
});
