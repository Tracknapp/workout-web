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

// Get filtered exercises based on equipment, muscles, and body parts with pagination
export const getFilteredExercises = query({
  args: {
    equipments: v.optional(v.array(v.string())),
    muscles: v.optional(v.array(v.string())),
    bodyParts: v.optional(v.array(v.string())),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    const hasFilters =
      (args.equipments && args.equipments.length > 0) ||
      (args.muscles && args.muscles.length > 0) ||
      (args.bodyParts && args.bodyParts.length > 0) ||
      (args.search && args.search.trim().length > 0);

    // If no filters, we can optimize with take()
    if (!hasFilters) {
      const exercises = await ctx.db
        .query("exercises")
        .order("desc")
        .take(offset + limit + 1); // Take one extra to check if there's more

      const hasMore = exercises.length > offset + limit;
      const paginatedExercises = exercises.slice(offset, offset + limit);

      return {
        exercises: paginatedExercises,
        total: offset + paginatedExercises.length,
        isDone: !hasMore,
      };
    }

    // With filters, we need to fetch more to account for filtering
    // Fetch up to 2000 exercises (should cover most use cases)
    const allExercises = await ctx.db
      .query("exercises")
      .order("desc")
      .take(2000);

    let exercises = allExercises;

    // Apply filters
    if (args.equipments && args.equipments.length > 0) {
      exercises = exercises.filter((exercise) =>
        args.equipments!.some((equipment) =>
          exercise.equipments.includes(equipment)
        )
      );
    }

    if (args.muscles && args.muscles.length > 0) {
      exercises = exercises.filter((exercise) =>
        args.muscles!.some(
          (muscle) =>
            exercise.targetMuscles.includes(muscle)
        )
      );
    }

    if (args.bodyParts && args.bodyParts.length > 0) {
      exercises = exercises.filter((exercise) =>
        args.bodyParts!.some((bodyPart) =>
          exercise.bodyParts.includes(bodyPart)
        )
      );
    }

    // Apply search filter (fuzzy search on exercise name)
    if (args.search && args.search.trim().length > 0) {
      const searchLower = args.search.toLowerCase().trim();
      exercises = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchLower)
      );
    }

    // Get total count
    const total = exercises.length;

    // Apply pagination
    const paginatedExercises = exercises.slice(offset, offset + limit);

    return {
      exercises: paginatedExercises,
      total,
      isDone: offset + limit >= total,
    };
  },
});
