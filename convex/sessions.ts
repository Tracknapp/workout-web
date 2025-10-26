import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./user";
import { Id } from "./_generated/dataModel";

// Start a new workout session from a routine
export const startSession = mutation({
  args: {
    routineId: v.id("routines"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    // Get routine details
    const routine = await ctx.db.get(args.routineId);
    if (!routine) {
      throw new Error("Routine not found");
    }

    // Get routine exercises with sets
    const routineExercises = await ctx.db
      .query("routineExercises")
      .withIndex("byRoutineId", (q) => q.eq("routineId", args.routineId))
      .collect();

    // Sort by order
    routineExercises.sort((a, b) => a.order - b.order);

    // Create workout session
    const sessionId = await ctx.db.insert("workoutSessions", {
      userId: userId as Id<"users">,
      routineName: routine.name,
      routineId: args.routineId,
      startTime: Date.now(),
      status: "in_progress",
    });

    // Create session exercises with sets
    for (const re of routineExercises) {
      // Get exercise details for snapshot
      const exercise = await ctx.db
        .query("exercises")
        .withIndex("byExerciseId", (q) => q.eq("exerciseId", re.exerciseId))
        .first();

      if (!exercise) continue;

      // Create session exercise
      const sessionExerciseId = await ctx.db.insert("sessionExercises", {
        sessionId,
        exerciseId: re.exerciseId,
        exerciseName: exercise.name,
        order: re.order,
        targetMuscles: exercise.targetMuscles,
        equipments: exercise.equipments,
        gifUrl: exercise.gifUrl,
      });

      // Get routine exercise sets
      const sets = await ctx.db
        .query("routineExerciseSets")
        .withIndex("byRoutineExerciseId", (q) =>
          q.eq("routineExerciseId", re._id)
        )
        .collect();

      // Sort sets by setNumber
      sets.sort((a, b) => a.setNumber - b.setNumber);

      // Create session sets
      for (const set of sets) {
        await ctx.db.insert("sessionSets", {
          sessionExerciseId,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          completed: false,
        });
      }
    }

    return sessionId;
  },
});

// Update a set's completion status
export const toggleSetCompletion = mutation({
  args: {
    setId: v.id("sessionSets"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.setId, {
      completed: args.completed,
      completedAt: args.completed ? Date.now() : undefined,
    });
    return { success: true };
  },
});

// Update set values (reps/weight)
export const updateSetValues = mutation({
  args: {
    setId: v.id("sessionSets"),
    reps: v.number(),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.setId, {
      reps: args.reps,
      weight: args.weight,
    });
    return { success: true };
  },
});

// Complete a workout session
export const completeSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      endTime: Date.now(),
    });
    return { success: true };
  },
});

// Abandon a workout session
export const abandonSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "abandoned",
      endTime: Date.now(),
    });
    return { success: true };
  },
});

// Get active session for a user (if any)
export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getCurrentUserId(ctx);

      const activeSession = await ctx.db
        .query("workoutSessions")
        .withIndex("byUserId", (q) => q.eq("userId", userId as Id<"users">))
        .filter((q) => q.eq(q.field("status"), "in_progress"))
        .first();

      return activeSession;
    } catch {
      return null;
    }
  },
});

// Get session with all exercises and sets
export const getSessionWithExercises = query({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const sessionExercises = await ctx.db
      .query("sessionExercises")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Sort by order
    sessionExercises.sort((a, b) => a.order - b.order);

    // Fetch sets for each exercise
    const exercisesWithSets = await Promise.all(
      sessionExercises.map(async (se) => {
        const sets = await ctx.db
          .query("sessionSets")
          .withIndex("bySessionExerciseId", (q) =>
            q.eq("sessionExerciseId", se._id)
          )
          .collect();

        // Sort sets by setNumber
        sets.sort((a, b) => a.setNumber - b.setNumber);

        return {
          ...se,
          sets,
        };
      })
    );

    return {
      ...session,
      exercises: exercisesWithSets,
    };
  },
});

// Get all sessions for a user (workout history)
export const getUserSessions = query({
  args: {
    status: v.optional(
      v.union(v.literal("in_progress"), v.literal("completed"), v.literal("abandoned"))
    ),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getCurrentUserId(ctx);

      let sessionsQuery = ctx.db
        .query("workoutSessions")
        .withIndex("byUserId", (q) => q.eq("userId", userId as Id<"users">));

      if (args.status) {
        sessionsQuery = sessionsQuery.filter((q) =>
          q.eq(q.field("status"), args.status!)
        );
      }

      const sessions = await sessionsQuery.collect();

      // Sort by startTime descending (most recent first)
      sessions.sort((a, b) => b.startTime - a.startTime);

      return sessions;
    } catch {
      return [];
    }
  },
});
