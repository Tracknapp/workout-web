import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./user";
import { Id } from "./_generated/dataModel";

// Create a new routine
export const createRoutine = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const routineId = await ctx.db.insert("routines", {
      name: args.name,
      userId: userId as Id<"users">,
    });

    return routineId;
  },
});

// Update a routine
export const updateRoutine = mutation({
  args: {
    routineId: v.id("routines"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.routineId, {
      name: args.name,
    });
    return { success: true };
  },
});

// Delete a routine (and all its exercises)
export const deleteRoutine = mutation({
  args: {
    routineId: v.id("routines"),
  },
  handler: async (ctx, args) => {
    // First, delete all routine exercises
    const routineExercises = await ctx.db
      .query("routineExercises")
      .withIndex("byRoutineId", (q) => q.eq("routineId", args.routineId))
      .collect();

    for (const exercise of routineExercises) {
      await ctx.db.delete(exercise._id);
    }

    // Then delete the routine
    await ctx.db.delete(args.routineId);
    return { success: true };
  },
});

// Add an exercise to a routine
export const addExerciseToRoutine = mutation({
  args: {
    routineId: v.id("routines"),
    exerciseId: v.string(),
    order: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const routineExerciseId = await ctx.db.insert("routineExercises", {
      routineId: args.routineId,
      exerciseId: args.exerciseId,
      order: args.order,
      notes: args.notes,
    });
    return routineExerciseId;
  },
});

// Update a routine exercise
export const updateRoutineExercise = mutation({
  args: {
    routineExerciseId: v.id("routineExercises"),
    order: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.order !== undefined) updates.order = args.order;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.routineExerciseId, updates);
    return { success: true };
  },
});

// Remove an exercise from a routine
export const removeExerciseFromRoutine = mutation({
  args: {
    routineExerciseId: v.id("routineExercises"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.routineExerciseId);
    return { success: true };
  },
});

// Reorder exercises in a routine
export const reorderRoutineExercises = mutation({
  args: {
    updates: v.array(
      v.object({
        routineExerciseId: v.id("routineExercises"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const update of args.updates) {
      await ctx.db.patch(update.routineExerciseId, {
        order: update.order,
      });
    }
    return { success: true };
  },
});

// Get all routines for a user
export const getUserRoutines = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getCurrentUserId(ctx);
      const routines = await ctx.db
        .query("routines")
        .withIndex("byUserId", (q) => q.eq("userId", userId as Id<"users">))
        .collect();

      return routines;
    } catch {
      return [];
    }
  },
});

// Get a single routine by ID
export const getRoutine = query({
  args: {
    routineId: v.id("routines"),
  },
  handler: async (ctx, args) => {
    const routine = await ctx.db.get(args.routineId);
    return routine;
  },
});

// Get all exercises in a routine with full exercise details
export const getRoutineExercises = query({
  args: {
    routineId: v.id("routines"),
  },
  handler: async (ctx, args) => {
    const routineExercises = await ctx.db
      .query("routineExercises")
      .withIndex("byRoutineId", (q) => q.eq("routineId", args.routineId))
      .collect();

    // Sort by order
    routineExercises.sort((a, b) => a.order - b.order);

    // Fetch full exercise details for each
    const exercisesWithDetails = await Promise.all(
      routineExercises.map(async (re) => {
        const exercise = await ctx.db
          .query("exercises")
          .withIndex("byExerciseId", (q) => q.eq("exerciseId", re.exerciseId))
          .first();

        return {
          _id: re._id,
          routineId: re.routineId,
          exerciseId: re.exerciseId,
          order: re.order,
          notes: re.notes,
          exercise: exercise, // Full exercise details
        };
      })
    );

    return exercisesWithDetails;
  },
});

// Get routine with all its exercises (full details)
export const getRoutineWithExercises = query({
  args: {
    routineId: v.id("routines"),
  },
  handler: async (ctx, args) => {
    const routine = await ctx.db.get(args.routineId);
    if (!routine) return null;

    const routineExercises = await ctx.db
      .query("routineExercises")
      .withIndex("byRoutineId", (q) => q.eq("routineId", args.routineId))
      .collect();

    // Sort by order
    routineExercises.sort((a, b) => a.order - b.order);

    // Fetch full exercise details
    const exercisesWithDetails = await Promise.all(
      routineExercises.map(async (re) => {
        const exercise = await ctx.db
          .query("exercises")
          .withIndex("byExerciseId", (q) => q.eq("exerciseId", re.exerciseId))
          .first();

        return {
          _id: re._id,
          routineId: re.routineId,
          exerciseId: re.exerciseId,
          order: re.order,
          notes: re.notes,
          exercise: exercise,
        };
      })
    );

    return {
      ...routine,
      exercises: exercisesWithDetails,
    };
  },
});
