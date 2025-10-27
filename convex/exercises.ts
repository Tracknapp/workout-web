import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

// Helper function to check if search query fuzzy matches the text
function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact substring match (highest priority)
  if (textLower.includes(queryLower)) {
    return true;
  }

  // Split text into words and check each word
  const words = textLower.split(/\s+/);

  for (const word of words) {
    // Allow 1 character difference for words up to 5 chars
    // Allow 2 character difference for words 6-10 chars
    // Allow 3 character difference for words 11+ chars
    const maxDistance =
      queryLower.length <= 5 ? 1 :
      queryLower.length <= 10 ? 2 : 3;

    const distance = levenshteinDistance(word, queryLower);

    if (distance <= maxDistance) {
      return true;
    }

    // Also check if query is a substring of the word (for partial matches)
    if (word.includes(queryLower) || queryLower.includes(word)) {
      return true;
    }
  }

  return false;
}

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
      const searchQuery = args.search.trim();
      exercises = exercises.filter((exercise) =>
        fuzzyMatch(exercise.name, searchQuery)
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

// Get a single exercise by exerciseId (for viewing details)
export const getExerciseByExerciseId = query({
  args: {
    exerciseId: v.string(),
  },
  handler: async (ctx, args) => {
    const exercise = await ctx.db
      .query("exercises")
      .withIndex("byExerciseId", (q) => q.eq("exerciseId", args.exerciseId))
      .first();

    return exercise;
  },
});
