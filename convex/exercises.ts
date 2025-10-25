import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all exercises
export const getAllExercises = query({
  args: {},
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exercises").collect();
    return exercises;
  },
});

// Get all equipments
export const getAllEquipments = query({
  args: {},
  handler: async (ctx) => {
    const equipments = await ctx.db.query("equipments").collect();
    return equipments;
  },
});

// Get all body parts
export const getAllBodyParts = query({
  args: {},
  handler: async (ctx) => {
    const bodyParts = await ctx.db.query("bodyParts").collect();
    return bodyParts;
  },
});

// Get all muscles
export const getAllMuscles = query({
  args: {},
  handler: async (ctx) => {
    const muscles = await ctx.db.query("muscles").collect();
    return muscles;
  },
});

// Get filtered exercises based on equipment, muscles, and body parts
export const getFilteredExercises = query({
  args: {
    equipments: v.optional(v.array(v.string())),
    muscles: v.optional(v.array(v.string())),
    bodyParts: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Fetch all exercises
    let exercises = await ctx.db.query("exercises").collect();

    // Filter by equipments if provided
    if (args.equipments && args.equipments.length > 0) {
      exercises = exercises.filter((exercise) =>
        args.equipments!.some((equipment) =>
          exercise.equipments.includes(equipment)
        )
      );
    }

    // Filter by muscles if provided (check both targetMuscles and secondaryMuscles)
    if (args.muscles && args.muscles.length > 0) {
      exercises = exercises.filter((exercise) =>
        args.muscles!.some(
          (muscle) =>
            exercise.targetMuscles.includes(muscle) ||
            exercise.secondaryMuscles.includes(muscle)
        )
      );
    }

    // Filter by body parts if provided
    if (args.bodyParts && args.bodyParts.length > 0) {
      exercises = exercises.filter((exercise) =>
        args.bodyParts!.some((bodyPart) =>
          exercise.bodyParts.includes(bodyPart)
        )
      );
    }

    return exercises;
  },
});
