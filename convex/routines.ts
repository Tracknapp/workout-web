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

// Delete a routine (and all its exercises and sets)
export const deleteRoutine = mutation({
  args: {
    routineId: v.id("routines"),
  },
  handler: async (ctx, args) => {
    // First, delete all routine exercises and their sets
    const routineExercises = await ctx.db
      .query("routineExercises")
      .withIndex("byRoutineId", (q) => q.eq("routineId", args.routineId))
      .collect();

    for (const exercise of routineExercises) {
      // Delete sets for this exercise
      const sets = await ctx.db
        .query("routineExerciseSets")
        .withIndex("byRoutineExerciseId", (q) =>
          q.eq("routineExerciseId", exercise._id)
        )
        .collect();

      for (const set of sets) {
        await ctx.db.delete(set._id);
      }

      // Delete the exercise
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
    const updates: { order?: number; notes?: string } = {};
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
    // First, delete all sets for this exercise
    const sets = await ctx.db
      .query("routineExerciseSets")
      .withIndex("byRoutineExerciseId", (q) =>
        q.eq("routineExerciseId", args.routineExerciseId)
      )
      .collect();

    for (const set of sets) {
      await ctx.db.delete(set._id);
    }

    // Then delete the exercise
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

// Save routine exercises with sets (bulk upsert)
export const saveRoutineExercises = mutation({
  args: {
    routineId: v.id("routines"),
    exercises: v.array(
      v.object({
        exerciseId: v.string(),
        order: v.number(),
        sets: v.array(
          v.object({
            setNumber: v.number(),
            reps: v.number(),
            weight: v.optional(v.number()),
            weightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kgs"))),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get existing routine exercises
    const existingExercises = await ctx.db
      .query("routineExercises")
      .withIndex("byRoutineId", (q) => q.eq("routineId", args.routineId))
      .collect();

    // Delete all existing routine exercises and their sets
    for (const exercise of existingExercises) {
      // Delete sets first
      const sets = await ctx.db
        .query("routineExerciseSets")
        .withIndex("byRoutineExerciseId", (q) =>
          q.eq("routineExerciseId", exercise._id)
        )
        .collect();

      for (const set of sets) {
        await ctx.db.delete(set._id);
      }

      // Delete exercise
      await ctx.db.delete(exercise._id);
    }

    // Insert new exercises and sets
    for (const exercise of args.exercises) {
      const routineExerciseId = await ctx.db.insert("routineExercises", {
        routineId: args.routineId,
        exerciseId: exercise.exerciseId,
        order: exercise.order,
      });

      // Insert sets for this exercise
      for (const set of exercise.sets) {
        await ctx.db.insert("routineExerciseSets", {
          routineExerciseId,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          weightUnit: set.weightUnit,
        });
      }
    }

    return { success: true };
  },
});

// Get all routines for a user with exercise count
export const getUserRoutines = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getCurrentUserId(ctx);
      const routines = await ctx.db
        .query("routines")
        .withIndex("byUserId", (q) => q.eq("userId", userId as Id<"users">))
        .collect();

      // Add exercise count to each routine
      const routinesWithCount = await Promise.all(
        routines.map(async (routine) => {
          const exerciseCount = await ctx.db
            .query("routineExercises")
            .withIndex("byRoutineId", (q) => q.eq("routineId", routine._id))
            .collect();

          return {
            ...routine,
            exerciseCount: exerciseCount.length,
          };
        })
      );

      return routinesWithCount;
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

// Get all exercises in a routine with full exercise details and sets
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

    // Fetch full exercise details and sets for each
    const exercisesWithDetails = await Promise.all(
      routineExercises.map(async (re) => {
        const exercise = await ctx.db
          .query("exercises")
          .withIndex("byExerciseId", (q) => q.eq("exerciseId", re.exerciseId))
          .first();

        // Fetch sets for this routine exercise
        const sets = await ctx.db
          .query("routineExerciseSets")
          .withIndex("byRoutineExerciseId", (q) =>
            q.eq("routineExerciseId", re._id)
          )
          .collect();

        // Sort sets by setNumber
        sets.sort((a, b) => a.setNumber - b.setNumber);

        return {
          _id: re._id,
          routineId: re.routineId,
          exerciseId: re.exerciseId,
          order: re.order,
          notes: re.notes,
          exercise: exercise, // Full exercise details
          sets: sets, // Sets with reps and weight
        };
      })
    );

    return exercisesWithDetails;
  },
});

// Get routine with all its exercises (full details) and sets
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

    // Fetch full exercise details and sets
    const exercisesWithDetails = await Promise.all(
      routineExercises.map(async (re) => {
        const exercise = await ctx.db
          .query("exercises")
          .withIndex("byExerciseId", (q) => q.eq("exerciseId", re.exerciseId))
          .first();

        // Fetch sets for this routine exercise
        const sets = await ctx.db
          .query("routineExerciseSets")
          .withIndex("byRoutineExerciseId", (q) =>
            q.eq("routineExerciseId", re._id)
          )
          .collect();

        // Sort sets by setNumber
        sets.sort((a, b) => a.setNumber - b.setNumber);

        return {
          _id: re._id,
          routineId: re.routineId,
          exerciseId: re.exerciseId,
          order: re.order,
          notes: re.notes,
          exercise: exercise,
          sets: sets,
        };
      })
    );

    return {
      ...routine,
      exercises: exercisesWithDetails,
    };
  },
});
