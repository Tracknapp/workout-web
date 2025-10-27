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
          weightUnit: set.weightUnit,
          time: set.time,
          distanceUnit: set.distanceUnit,
          completed: false,
        });
      }
    }

    return sessionId;
  },
});

// Add a new set to a session exercise
export const addSetToExercise = mutation({
  args: {
    sessionExerciseId: v.id("sessionExercises"),
    setNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const setId = await ctx.db.insert("sessionSets", {
      sessionExerciseId: args.sessionExerciseId,
      setNumber: args.setNumber,
      reps: 0,
      weight: undefined,
      weightUnit: undefined,
      time: undefined,
      distanceUnit: undefined,
      completed: false,
    });

    return setId;
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

// Update set values (reps/weight/time)
export const updateSetValues = mutation({
  args: {
    setId: v.id("sessionSets"),
    reps: v.number(),
    weight: v.optional(v.number()),
    weightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kgs"))),
    time: v.optional(v.string()),
    distanceUnit: v.optional(v.union(v.literal("km"), v.literal("m"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.setId, {
      reps: args.reps,
      weight: args.weight,
      weightUnit: args.weightUnit,
      time: args.time,
      distanceUnit: args.distanceUnit,
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

// Abandon a workout session - deletes the session and all related data
export const abandonSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    // Get all session exercises for this session
    const sessionExercises = await ctx.db
      .query("sessionExercises")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Delete all sets for each session exercise
    for (const sessionExercise of sessionExercises) {
      const sets = await ctx.db
        .query("sessionSets")
        .withIndex("bySessionExerciseId", (q) =>
          q.eq("sessionExerciseId", sessionExercise._id)
        )
        .collect();

      // Delete each set
      for (const set of sets) {
        await ctx.db.delete(set._id);
      }

      // Delete the session exercise
      await ctx.db.delete(sessionExercise._id);
    }

    // Delete the workout session itself
    await ctx.db.delete(args.sessionId);

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

// Get workout statistics for charts (completed workouts grouped by time period)
export const getWorkoutStats = query({
  args: {
    period: v.union(
      v.literal("week"),
      v.literal("month"),
      v.literal("year"),
      v.literal("all")
    ),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getCurrentUserId(ctx);

      // Get all completed sessions
      const sessions = await ctx.db
        .query("workoutSessions")
        .withIndex("byUserId", (q) => q.eq("userId", userId as Id<"users">))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .collect();

      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Filter by time period
      let filteredSessions = sessions;
      let periodInDays = 7; // Default for week

      switch (args.period) {
        case "week":
          periodInDays = 7;
          filteredSessions = sessions.filter(
            (s) => s.startTime >= now - 7 * oneDayMs
          );
          break;
        case "month":
          periodInDays = 30;
          filteredSessions = sessions.filter(
            (s) => s.startTime >= now - 30 * oneDayMs
          );
          break;
        case "year":
          periodInDays = 365;
          filteredSessions = sessions.filter(
            (s) => s.startTime >= now - 365 * oneDayMs
          );
          break;
        case "all":
          filteredSessions = sessions;
          // Calculate days from first workout to now
          if (sessions.length > 0) {
            const oldestSession = sessions.reduce((oldest, current) =>
              current.startTime < oldest.startTime ? current : oldest
            );
            periodInDays = Math.ceil(
              (now - oldestSession.startTime) / oneDayMs
            );
          }
          break;
      }

      // Group by date
      const workoutsByDate = new Map<string, number>();

      // Initialize all dates in the period with 0
      const startDate = new Date(now - periodInDays * oneDayMs);
      for (let i = 0; i < periodInDays; i++) {
        const date = new Date(startDate.getTime() + i * oneDayMs);
        const dateKey = date.toISOString().split("T")[0];
        workoutsByDate.set(dateKey, 0);
      }

      // Count workouts by date
      filteredSessions.forEach((session) => {
        const date = new Date(session.startTime);
        const dateKey = date.toISOString().split("T")[0];
        workoutsByDate.set(dateKey, (workoutsByDate.get(dateKey) || 0) + 1);
      });

      // Convert to array format for charts
      const chartData = Array.from(workoutsByDate.entries())
        .map(([date, count]) => ({
          date,
          workouts: count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        data: chartData,
        totalWorkouts: filteredSessions.length,
        period: args.period,
      };
    } catch {
      return {
        data: [],
        totalWorkouts: 0,
        period: args.period,
      };
    }
  },
});
